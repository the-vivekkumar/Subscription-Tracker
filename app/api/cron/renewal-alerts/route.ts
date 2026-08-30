import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendRenewalAlert } from "@/lib/email";
import { format } from "date-fns";

/** Default reminder schedule (days before renewal). Email reminders are ON by default. */
const DEFAULT_ALERT_DAYS = [30, 14, 7, 3, 1, 0];

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const secret = process.env.CRON_SECRET;
  const isAuthorized =
    (secret && authHeader === `Bearer ${secret}`) ||
    (isVercelCron && !!secret);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Server missing SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Server missing RESEND_API_KEY" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceKey);
  const today = new Date();
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const days of DEFAULT_ALERT_DAYS) {
    const target = new Date(today);
    target.setDate(target.getDate() + days);
    const targetStr = format(target, "yyyy-MM-dd");

    const { data: subs, error: subsError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .eq("next_renewal", targetStr);

    if (subsError) {
      console.error("cron subs error", subsError.message);
      continue;
    }
    if (!subs?.length) continue;

    for (const sub of subs) {
      // Idempotency: never send the same reminder twice
      const { data: existing } = await supabase
        .from("alert_logs")
        .select("id")
        .eq("subscription_id", sub.id)
        .eq("renewal_date", targetStr)
        .eq("days_before", days)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, notification_email, notification_days")
        .eq("id", sub.user_id)
        .maybeSingle();

      // Default ON: only skip if user explicitly disabled email
      if (profile && profile.notification_email === false) continue;

      const allowedDays =
        profile?.notification_days?.length > 0
          ? profile.notification_days
          : DEFAULT_ALERT_DAYS;
      if (!allowedDays.includes(days)) continue;

      const { data: userData } = await supabase.auth.admin.getUserById(
        sub.user_id
      );
      const email = userData?.user?.email;
      if (!email) continue;

      const result = await sendRenewalAlert({
        to: email,
        userName: profile?.full_name || undefined,
        subscriptionName: sub.name,
        cost: Number(sub.cost),
        currency: sub.currency || "USD",
        renewalDate: sub.next_renewal,
        daysLeft: days,
        billingCycle: sub.billing_cycle,
      });

      if (!result.success) {
        failed++;
        console.error("email failed", sub.id, result.error);
        continue;
      }

      await supabase.from("alert_logs").insert({
        user_id: sub.user_id,
        subscription_id: sub.id,
        renewal_date: targetStr,
        days_before: days,
      });

      await supabase.from("notifications").insert({
        user_id: sub.user_id,
        title:
          days === 0
            ? `${sub.name} renews today`
            : `${sub.name} renews in ${days} day${days === 1 ? "" : "s"}`,
        message: `${sub.name} · ${sub.currency || "USD"} ${Number(sub.cost).toFixed(2)} · ${sub.next_renewal}`,
        type: "renewal",
        related_id: sub.id,
      });

      sent++;
    }
  }

  return NextResponse.json({ sent, skipped, failed });
}
