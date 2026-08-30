import { z } from "zod";
import { CATEGORIES, BILLING_CYCLES, STATUSES } from "@/types";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  companyName: z.string().optional(),
});

export const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  company_name: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable().or(z.literal("")),
});

export const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  vendor: z.string().max(200).optional().nullable(),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  cost: z.coerce.number().min(0, "Cost must be >= 0"),
  currency: z.literal("USD").default("USD"),
  billing_cycle: z.enum(["monthly", "yearly", "quarterly"]),
  next_renewal: z.string().min(1, "Next renewal date is required"),
  owner: z.string().max(100).optional().nullable(),
  status: z.enum(["active", "cancelled", "under_review"]).default("active"),
  notes: z.string().max(2000).optional().nullable(),
  last_reviewed: z.string().optional().nullable(),
});

export const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export const notificationPrefsSchema = z.object({
  notification_email: z.boolean(),
  notification_days: z.array(z.number()).min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;
