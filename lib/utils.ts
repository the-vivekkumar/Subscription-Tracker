import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addMonths, addYears, addQuarters, differenceInDays, parseISO, isBefore, isAfter } from "date-fns";
import type { BillingCycle, Subscription } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return format(typeof date === "string" ? parseISO(date) : date, "MMM d, yyyy");
}

export function formatShortDate(date: string | Date) {
  return format(typeof date === "string" ? parseISO(date) : date, "MMM d");
}

/** Normalize cost to monthly amount */
export function toMonthlyCost(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "monthly":
      return cost;
    case "yearly":
      return cost / 12;
    case "quarterly":
      return cost / 3;
    default:
      return cost;
  }
}

/** Normalize cost to annual amount */
export function toAnnualCost(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "monthly":
      return cost * 12;
    case "yearly":
      return cost;
    case "quarterly":
      return cost * 4;
    default:
      return cost;
  }
}

/** Calculate next renewal from a given date + cycle */
export function calculateNextRenewal(from: Date, cycle: BillingCycle): Date {
  switch (cycle) {
    case "monthly":
      return addMonths(from, 1);
    case "yearly":
      return addYears(from, 1);
    case "quarterly":
      return addQuarters(from, 1);
    default:
      return addMonths(from, 1);
  }
}

export function daysUntil(date: string | Date): number {
  const d = typeof date === "string" ? parseISO(date) : date;
  return differenceInDays(d, new Date());
}

export function isUpcoming(date: string, withinDays = 30): boolean {
  const days = daysUntil(date);
  return days >= 0 && days <= withinDays;
}

export function isOverdueReview(lastReviewed: string | null, thresholdDays = 90): boolean {
  if (!lastReviewed) return true;
  return daysUntil(lastReviewed) < -thresholdDays;
}

/** Detect potential duplicates: same name (case-insensitive) or same category + cost within 10% */
export function findPotentialDuplicates(subs: Subscription[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  const nameMap = new Map<string, string[]>();

  for (const sub of subs) {
    if (sub.status === "cancelled") continue;
    const key = sub.name.toLowerCase().trim();
    if (!nameMap.has(key)) nameMap.set(key, []);
    nameMap.get(key)!.push(sub.id);
  }

  for (const [name, ids] of nameMap) {
    if (ids.length > 1) {
      groups.set(`name:${name}`, ids);
    }
  }

  // Category + similar cost
  const byCategory = new Map<string, Subscription[]>();
  for (const sub of subs) {
    if (sub.status === "cancelled") continue;
    if (!byCategory.has(sub.category)) byCategory.set(sub.category, []);
    byCategory.get(sub.category)!.push(sub);
  }

  for (const [cat, list] of byCategory) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        const monthlyA = toMonthlyCost(a.cost, a.billing_cycle);
        const monthlyB = toMonthlyCost(b.cost, b.billing_cycle);
        const avg = (monthlyA + monthlyB) / 2;
        if (avg > 0 && Math.abs(monthlyA - monthlyB) / avg < 0.1) {
          const key = `cat:${cat}:${a.id}-${b.id}`;
          groups.set(key, [a.id, b.id]);
        }
      }
    }
  }

  return groups;
}

export function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "cancelled":
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
    case "under_review":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
}
