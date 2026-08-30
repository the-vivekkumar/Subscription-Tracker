"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/actions/profile";
import {
  toMonthlyCost,
  toAnnualCost,
  isUpcoming,
  isOverdueReview,
} from "@/lib/utils";
import type { DashboardStats, Subscription } from "@/types";

/**
 * Dashboard stats from real subscription data only.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await ensureProfile();

  const { data: subs, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;

  const subscriptions = (subs || []) as Subscription[];
  const active = subscriptions.filter((s) => s.status === "active");

  const totalMonthlySpend = active.reduce(
    (sum, s) => sum + toMonthlyCost(Number(s.cost), s.billing_cycle),
    0
  );
  const totalAnnualSpend = active.reduce(
    (sum, s) => sum + toAnnualCost(Number(s.cost), s.billing_cycle),
    0
  );

  const upcomingRenewals = active.filter((s) =>
    isUpcoming(s.next_renewal, 30)
  ).length;

  const needsReview = active.filter((s) => isOverdueReview(s.last_reviewed));
  const needsReviewCount = needsReview.length;
  const needsReviewMonthly = needsReview.reduce(
    (sum, s) => sum + toMonthlyCost(Number(s.cost), s.billing_cycle),
    0
  );

  return {
    totalMonthlySpend: Math.round(totalMonthlySpend * 100) / 100,
    totalAnnualSpend: Math.round(totalAnnualSpend * 100) / 100,
    activeCount: active.length,
    upcomingRenewals,
    needsReviewCount,
    needsReviewMonthly: Math.round(needsReviewMonthly * 100) / 100,
  };
}
