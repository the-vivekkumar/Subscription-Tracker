"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

/**
 * Ensures a profiles row exists for the authenticated user.
 * Fixes FK failures when the user signed up before the trigger existed,
 * or when the trigger did not run.
 * Always uses the server-side auth user id — never a client-supplied id.
 */
export async function ensureProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "";

  const { data: created, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        company_name: (user.user_metadata?.company_name as string) || null,
        avatar_url: (user.user_metadata?.avatar_url as string) || null,
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    console.error("ensureProfile error:", error.message);
    return null;
  }

  return created as Profile;
}

export async function getOrCreateProfile(): Promise<Profile> {
  const profile = await ensureProfile();
  if (!profile) throw new Error("Unauthorized or could not load profile");
  return profile;
}
