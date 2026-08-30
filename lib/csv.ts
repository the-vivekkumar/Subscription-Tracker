import type { Subscription } from "@/types";

export function subscriptionsToCSV(subs: Subscription[]): string {
  const headers = [
    "Name",
    "Vendor",
    "Category",
    "Cost",
    "Currency",
    "Billing Cycle",
    "Next Renewal",
    "Owner",
    "Status",
    "Notes",
    "Last Reviewed",
  ];

  const rows = subs.map((s) =>
    [
      escapeCSV(s.name),
      escapeCSV(s.vendor || ""),
      escapeCSV(s.category),
      s.cost,
      s.currency,
      s.billing_cycle,
      s.next_renewal,
      escapeCSV(s.owner || ""),
      s.status,
      escapeCSV(s.notes || ""),
      s.last_reviewed || "",
    ].join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
