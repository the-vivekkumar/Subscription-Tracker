"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { subscriptionSchema, type SubscriptionInput } from "@/lib/validations";
import { ensureProfile } from "@/lib/actions/profile";

export async function getSubscriptions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await ensureProfile();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("next_renewal", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProfile() {
  return ensureProfile();
}

export async function createSubscription(input: SubscriptionInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Guarantee profiles row exists so subscriptions_user_id_fkey succeeds
  const profile = await ensureProfile();
  if (!profile) {
    return {
      error:
        "Your profile could not be created. Try signing out and signing in again.",
    };
  }

  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Validation failed" };
  }

  const payload = {
    name: parsed.data.name.trim(),
    vendor: parsed.data.vendor?.trim() || null,
    category: parsed.data.category,
    cost: parsed.data.cost,
    currency: "USD",
    billing_cycle: parsed.data.billing_cycle,
    next_renewal: parsed.data.next_renewal,
    owner: parsed.data.owner?.trim() || null,
    status: parsed.data.status,
    notes: parsed.data.notes?.trim() || null,
    last_reviewed:
      parsed.data.last_reviewed || new Date().toISOString().slice(0, 10),
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("subscriptions")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("createSubscription:", error.message);
    if (error.message.includes("foreign key") || error.code === "23503") {
      return {
        error:
          "Unable to save subscription. Your account profile is missing — try signing out and signing in again, or re-run the database schema in Supabase.",
      };
    }
    return { error: "Unable to save subscription. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/subscriptions");
  revalidatePath("/renewals");
  return { data };
}

export async function updateSubscription(
  id: string,
  input: Partial<SubscriptionInput>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) update.name = input.name.trim();
  if (input.vendor !== undefined) update.vendor = input.vendor?.trim() || null;
  if (input.category !== undefined) update.category = input.category;
  if (input.cost !== undefined) update.cost = input.cost;
  update.currency = "USD";
  if (input.billing_cycle !== undefined)
    update.billing_cycle = input.billing_cycle;
  if (input.next_renewal !== undefined) update.next_renewal = input.next_renewal;
  if (input.owner !== undefined) update.owner = input.owner?.trim() || null;
  if (input.status !== undefined) update.status = input.status;
  if (input.notes !== undefined) update.notes = input.notes?.trim() || null;
  if (input.last_reviewed !== undefined)
    update.last_reviewed = input.last_reviewed || null;

  const { data, error } = await supabase
    .from("subscriptions")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/subscriptions");
  revalidatePath("/renewals");
  return { data };
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/subscriptions");
  revalidatePath("/renewals");
  return { success: true };
}

export async function bulkUpdateStatus(ids: string[], status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("subscriptions")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/subscriptions");
  return { success: true };
}

export async function markReviewed(id: string) {
  return updateSubscription(id, {
    last_reviewed: new Date().toISOString().slice(0, 10),
  });
}
