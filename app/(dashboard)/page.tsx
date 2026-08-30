import { Metadata } from "next";
import Link from "next/link";
import { Plus, DollarSign, CreditCard, Bell, ClipboardList } from "lucide-react";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpcomingRenewals } from "@/components/dashboard/upcoming-renewals";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const hasData = stats.activeCount > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your software spend and upcoming renewals
          </p>
        </div>
        <Button asChild>
          <Link href="/subscriptions?action=add">
            <Plus className="h-4 w-4" />
            Add subscription
          </Link>
        </Button>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Your subscription list is empty</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Add your first subscription to start tracking software costs and renewals.
              </p>
            </div>
            <Button asChild>
              <Link href="/subscriptions?action=add">
                <Plus className="h-4 w-4" />
                Add subscription
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly spend
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {formatCurrency(stats.totalMonthlySpend)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalAnnualSpend)} estimated / year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active subscriptions
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stats.activeCount}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming renewals
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {stats.upcomingRenewals}
                </div>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Needs review
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {stats.needsReviewCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.needsReviewCount > 0
                    ? `${formatCurrency(stats.needsReviewMonthly)}/mo · not reviewed in 90+ days`
                    : "All reviewed recently"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming renewals</CardTitle>
              <CardDescription>Next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingRenewals />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
