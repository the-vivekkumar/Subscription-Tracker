export type BillingCycle = "monthly" | "yearly" | "quarterly";

export type SubscriptionStatus = "active" | "cancelled" | "under_review";

export type SubscriptionCategory =
  | "Productivity"
  | "Design"
  | "Marketing"
  | "Sales"
  | "Dev Tools"
  | "Communication"
  | "Finance"
  | "Other";

export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  notification_email: boolean;
  notification_days: number[];
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  vendor: string | null;
  category: SubscriptionCategory;
  cost: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_renewal: string;
  owner: string | null;
  status: SubscriptionStatus;
  notes: string | null;
  last_reviewed: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "renewal" | "review" | "system";
  read: boolean;
  related_id: string | null;
  created_at: string;
}

export interface AlertLog {
  id: string;
  user_id: string;
  subscription_id: string;
  renewal_date: string;
  days_before: number;
  created_at: string;
}

export interface DashboardStats {
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  activeCount: number;
  upcomingRenewals: number;
  needsReviewCount: number;
  needsReviewMonthly: number;
}

export const CATEGORIES: SubscriptionCategory[] = [
  "Productivity",
  "Design",
  "Marketing",
  "Sales",
  "Dev Tools",
  "Communication",
  "Finance",
  "Other",
];

export const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "quarterly", label: "Quarterly" },
];

export const STATUSES: { value: SubscriptionStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
  { value: "under_review", label: "Under Review" },
];

export const ACCOUNT_CURRENCY = "USD";
