"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  subscriptionSchema,
  type SubscriptionInput,
} from "@/lib/validations";
import { createSubscription, updateSubscription } from "@/lib/actions/subscriptions";
import { CATEGORIES, BILLING_CYCLES, STATUSES, type Subscription } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription | null;
  onSuccess?: () => void;
}

export function SubscriptionForm({
  open,
  onOpenChange,
  subscription,
  onSuccess,
}: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!subscription;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubscriptionInput>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: subscription
      ? {
          name: subscription.name,
          vendor: subscription.vendor || "",
          category: subscription.category,
          cost: Number(subscription.cost),
          currency: subscription.currency,
          billing_cycle: subscription.billing_cycle,
          next_renewal: subscription.next_renewal,
          owner: subscription.owner || "",
          status: subscription.status,
          notes: subscription.notes || "",
          last_reviewed: subscription.last_reviewed || "",
        }
      : {
          currency: "USD",
          billing_cycle: "monthly",
          status: "active",
          category: "Other",
          notes: "",
          owner: "",
          vendor: "",
          next_renewal: new Date().toISOString().slice(0, 10),
        },
  });

  async function onSubmit(data: SubscriptionInput) {
    setLoading(true);
    const result = isEdit
      ? await updateSubscription(subscription!.id, data)
      : await createSubscription(data);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Subscription updated" : "Subscription added");
    reset();
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit subscription" : "Add subscription"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" placeholder="Notion, Figma, ..." {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="vendor">Vendor / Website</Label>
              <Input id="vendor" placeholder="https://notion.so" {...register("vendor")} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={watch("category")}
                onValueChange={(v) => setValue("category", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost *</Label>
              <Input id="cost" type="number" step="0.01" min="0" {...register("cost")} />
              {errors.cost && <p className="text-sm text-destructive">{errors.cost.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Billing cycle *</Label>
              <Select
                value={watch("billing_cycle")}
                onValueChange={(v) => setValue("billing_cycle", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_renewal">Next renewal *</Label>
              <Input id="next_renewal" type="date" {...register("next_renewal")} />
              {errors.next_renewal && (
                <p className="text-sm text-destructive">{errors.next_renewal.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input id="owner" placeholder="jane@company.com" {...register("owner")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
