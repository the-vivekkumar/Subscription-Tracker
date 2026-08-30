import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOrCreateProfile } from "@/lib/actions/profile";
import { getTeamMembers } from "@/lib/actions/team";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const [profile, teamMembers] = await Promise.all([
    getOrCreateProfile(),
    getTeamMembers(),
  ]);

  if (!profile) redirect("/login");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and subscription owners
        </p>
      </div>
      <SettingsClient profile={profile} teamMembers={teamMembers || []} />
    </div>
  );
}
