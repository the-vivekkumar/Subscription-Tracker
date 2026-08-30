import { Metadata } from "next";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { formatCurrency, formatDate, daysUntil, isUpcoming } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Renewals",
};

export default async function RenewalsPage() {
  const subs = await getSubscriptions();
  const upcoming = (subs || [])
    .filter((s) => s.status === "active" && isUpcoming(s.next_renewal, 60))
    .sort((a, b) => daysUntil(a.next_renewal) - daysUntil(b.next_renewal));

  const groups = {
    critical: upcoming.filter((s) => daysUntil(s.next_renewal) <= 7),
    soon: upcoming.filter((s) => {
      const d = daysUntil(s.next_renewal);
      return d > 7 && d <= 14;
    }),
    later: upcoming.filter((s) => daysUntil(s.next_renewal) > 14),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Renewals</h1>
        <p className="text-muted-foreground">
          Upcoming subscription renewals and alerts
        </p>
      </div>

      {upcoming.length === 0 ? (
        <Card>
          <CardContent className="flex h-48 flex-col items-center justify-center gap-2">
            <Bell className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No renewals in the next 60 days</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.critical.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-destructive">
                Next 7 days
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {groups.critical.map((sub) => (
                  <RenewalCard key={sub.id} sub={sub} />
                ))}
              </div>
            </section>
          )}
          {groups.soon.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-600">
                8–14 days
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {groups.soon.map((sub) => (
                  <RenewalCard key={sub.id} sub={sub} />
                ))}
              </div>
            </section>
          )}
          {groups.later.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                15–60 days
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {groups.later.map((sub) => (
                  <RenewalCard key={sub.id} sub={sub} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function RenewalCard({ sub }: { sub: any }) {
  const days = daysUntil(sub.next_renewal);
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{sub.name}</CardTitle>
          <Badge variant={days <= 3 ? "destructive" : days <= 7 ? "default" : "secondary"}>
            {days === 0 ? "Today" : `${days} days`}
          </Badge>
        </div>
        <CardDescription>
          {formatDate(sub.next_renewal)} · {formatCurrency(Number(sub.cost), sub.currency)} /{" "}
          {sub.billing_cycle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sub.owner && (
          <p className="text-sm text-muted-foreground">Owner: {sub.owner}</p>
        )}
      </CardContent>
    </Card>
  );
}
