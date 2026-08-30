"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Users, Mail } from "lucide-react";
import {
  profileSchema,
  teamMemberSchema,
  type ProfileInput,
} from "@/lib/validations";
import type { Profile, TeamMember } from "@/types";
import { addTeamMember, removeTeamMember } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface SettingsClientProps {
  profile: Profile;
  teamMembers: TeamMember[];
}

export function SettingsClient({
  profile,
  teamMembers: initialMembers,
}: SettingsClientProps) {
  const [loading, setLoading] = useState(false);
  const [emailOn, setEmailOn] = useState(profile.notification_email !== false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [members, setMembers] = useState(initialMembers);
  const [memberLoading, setMemberLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || "",
      company_name: profile.company_name || "",
      avatar_url: profile.avatar_url || "",
    },
  });

  async function onSubmit(data: ProfileInput) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        company_name: data.company_name || null,
        avatar_url: data.avatar_url || null,
      })
      .eq("id", profile.id);
    setLoading(false);
    if (error) toast.error("Could not update profile");
    else toast.success("Profile updated");
  }

  async function toggleEmailReminders(next: boolean) {
    setEmailSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        notification_email: next,
        // Keep full default schedule when enabling
        notification_days: next ? [30, 14, 7, 3, 1, 0] : profile.notification_days,
      })
      .eq("id", profile.id);
    setEmailSaving(false);
    if (error) {
      toast.error("Could not update reminder settings");
      return;
    }
    setEmailOn(next);
    toast.success(next ? "Email reminders enabled" : "Email reminders disabled");
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    const parsed = teamMemberSchema.safeParse({
      name: newName,
      email: newEmail,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Invalid input");
      return;
    }
    setMemberLoading(true);
    const res = await addTeamMember(parsed.data);
    setMemberLoading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (res.data) {
      setMembers((prev) => [...prev, res.data as TeamMember]);
      setNewName("");
      setNewEmail("");
      toast.success("Owner added");
    }
  }

  async function handleRemoveMember(id: string) {
    const res = await removeTeamMember(id);
    if (res.error) toast.error(res.error);
    else {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Removed");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your name and company shown in the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && (
                <p className="text-sm text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name">Company name</Label>
              <Input id="company_name" {...register("company_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                placeholder="https://..."
                {...register("avatar_url")}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email reminders
          </CardTitle>
          <CardDescription>
            Automatic emails before renewals (30, 14, 7, 3, 1, and 0 days). On
            by default for every account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Send renewal reminder emails</p>
              <p className="text-sm text-muted-foreground">
                Uses the email on your account
              </p>
            </div>
            <Button
              type="button"
              variant={emailOn ? "default" : "outline"}
              disabled={emailSaving}
              onClick={() => toggleEmailReminders(!emailOn)}
            >
              {emailSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : emailOn ? (
                "On"
              ) : (
                "Off"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Email delivery requires Resend and a daily cron job. See the README
            for setup.
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subscription owners
          </CardTitle>
          <CardDescription>
            Names you can assign as owners on subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={handleAddMember}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                placeholder="Jane Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="jane@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={memberLoading}>
              {memberLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </Button>
          </form>

          {members.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No owners yet. Add people so you can assign them on subscriptions.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-muted-foreground">{m.email}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveMember(m.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
