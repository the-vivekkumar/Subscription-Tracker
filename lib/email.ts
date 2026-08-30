import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function formatMoney(cost: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(cost);
  } catch {
    return `${currency} ${cost.toFixed(2)}`;
  }
}

function daysLabel(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow (1 day)";
  return `in ${days} days`;
}

export async function sendRenewalAlert(params: {
  to: string;
  userName?: string;
  subscriptionName: string;
  cost: number;
  currency: string;
  renewalDate: string;
  daysLeft: number;
  billingCycle?: string;
}) {
  const resend = getResend();
  if (!resend) {
    return { success: false, error: "RESEND_API_KEY is not configured" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Subscription Tracker <onboarding@resend.dev>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const name = params.userName || "there";
  const money = formatMoney(params.cost, params.currency);
  const when = daysLabel(params.daysLeft);
  const cycle = params.billingCycle
    ? params.billingCycle.charAt(0).toUpperCase() + params.billingCycle.slice(1)
    : "";

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: `Subscription renewal reminder: ${params.subscriptionName}`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; color: #111; line-height: 1.5;">
          <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Subscription Tracker</h1>
          <p>Hi ${name},</p>
          <p>Your <strong>${params.subscriptionName}</strong> subscription is coming up for renewal <strong>${when}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Subscription</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${params.subscriptionName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Cost</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${money}</td>
            </tr>
            ${
              cycle
                ? `<tr>
              <td style="padding: 8px 0; color: #666;">Billing cycle</td>
              <td style="padding: 8px 0; text-align: right;">${cycle}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 8px 0; color: #666;">Renewal date</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${params.renewalDate}</td>
            </tr>
          </table>
          <p style="font-size: 14px; color: #444;">
            This is your ${params.daysLeft === 0 ? "renewal-day" : `${params.daysLeft}-day`} reminder.
            Review the subscription if you want to keep or cancel it.
          </p>
          <p style="margin-top: 24px;">
            <a href="${appUrl}/renewals" style="display: inline-block; background: #111; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">
              Open Subscription Tracker
            </a>
          </p>
          <p style="margin-top: 32px; font-size: 12px; color: #888;">
            You received this because email reminders are enabled for your account.
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to send email",
    };
  }
}
