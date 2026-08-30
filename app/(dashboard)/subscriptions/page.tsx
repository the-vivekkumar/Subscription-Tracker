"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { getSubscriptions, deleteSubscription, bulkUpdateStatus } from "@/lib/actions/subscriptions";
import { formatCurrency, formatDate, getStatusColor, daysUntil } from "@/lib/utils";
import { subscriptionsToCSV, downloadCSV } from "@/lib/csv";
import type { Subscription } from "@/types";
import { CATEGORIES, STATUSES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { Card, CardContent } from "@/components/ui/card";

// Minimal checkbox for bulk
function Checkbox({ checked, onCheckedChange, ...props }: any) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className="h-4 w-4 rounded border-input"
      {...props}
    />
  );
}

function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getSubscriptions();
      setSubs(data || []);
    } catch (e) {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (searchParams.get("action") === "add") {
      setFormOpen(true);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.vendor || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.owner || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [subs, search, categoryFilter, statusFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this subscription?")) return;
    const res = await deleteSubscription(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Deleted");
      load();
    }
  }

  async function handleBulk(status: string) {
    if (!selected.size) return;
    const res = await bulkUpdateStatus(Array.from(selected), status);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Updated");
      setSelected(new Set());
      load();
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.id)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage all your SaaS tools in one place
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const csv = subscriptionsToCSV(filtered.length ? filtered : subs);
              downloadCSV(csv, `subscription-tracker-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`);
              toast.success("CSV exported");
            }}
            disabled={!subs.length}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, vendor, owner..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => handleBulk("under_review")}>
            <AlertCircle className="h-3.5 w-3.5" />
            Mark under review
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulk("cancelled")}>
            <CheckCircle className="h-3.5 w-3.5" />
            Mark cancelled
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <p className="text-muted-foreground">No subscriptions found</p>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add your first subscription
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="w-10 px-4 py-3 text-left">
                      <Checkbox
                        checked={selected.size === filtered.length && filtered.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Cost</th>
                    <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">Renewal</th>
                    <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => (
                    <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selected.has(sub.id)}
                          onCheckedChange={() => toggleSelect(sub.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{sub.name}</div>
                        {sub.owner && (
                          <div className="text-xs text-muted-foreground">{sub.owner}</div>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">{sub.category}</td>
                      <td className="px-4 py-3">
                        {formatCurrency(Number(sub.cost), sub.currency)}
                        <span className="text-xs text-muted-foreground">
                          /{sub.billing_cycle === "monthly" ? "mo" : sub.billing_cycle === "yearly" ? "yr" : "qtr"}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {formatDate(sub.next_renewal)}
                        <div className="text-xs text-muted-foreground">
                          {daysUntil(sub.next_renewal) >= 0
                            ? `${daysUntil(sub.next_renewal)}d left`
                            : "Overdue"}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(sub.status)}`}
                        >
                          {sub.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditing(sub);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(sub.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <SubscriptionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        subscription={editing}
        onSuccess={load}
      />
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<div className="flex h-48 items-center justify-center text-muted-foreground">Loading...</div>}>
      <SubscriptionsContent />
    </Suspense>
  );
}
