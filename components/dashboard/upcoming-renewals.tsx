import Link from "next/link";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { formatCurrency, formatShortDate, daysUntil, isUpcoming } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export async function UpcomingRenewals() {
  const subs = await getSubscriptions();
  const upcoming = (subs || [])
    .filter((s) => s.status === "active" && isUpcoming(s.next_renewal, 30))
    .sort((a, b) => daysUntil(a.next_renewal) - daysUntil(b.next_renewal))
    .slice(0, 5);

  if (!upcoming.length) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
        <p>No upcoming renewals in the next 30 days.</p>
        <Link href="/subscriptions" className="text-primary underline-offset-4 hover:underline">
          Manage subscriptions
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {upcoming.map((sub) => {
        const days = daysUntil(sub.next_renewal);
        return (
          <li
            key={sub.id}
            className="flex items-center justify-between gap-2 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{sub.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatShortDate(sub.next_renewal)} · {formatCurrency(Number(sub.cost), sub.currency)}
              </p>
            </div>
            <Badge variant={days <= 7 ? "destructive" : "secondary"}>
              {days === 0 ? "Today" : `${days}d`}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
