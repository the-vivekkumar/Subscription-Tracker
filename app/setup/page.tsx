import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup — Subscription Tracker",
};

export default function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Configuration required
          </h1>
          <p className="text-sm text-muted-foreground">
            Subscription Tracker needs Supabase credentials before it can run.
            This is not a bug — the app refuses to start without real
            configuration.
          </p>
        </div>

        <ol className="list-decimal space-y-3 pl-5 text-sm text-foreground">
          <li>
            Create a free project at{" "}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
            >
              supabase.com
            </a>
          </li>
          <li>
            Open <strong>Project Settings → API</strong> and copy the{" "}
            <strong>Project URL</strong> and <strong>anon public</strong> key.
          </li>
          <li>
            In the project root, copy the example env file:
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
              cp .env.example .env.local
            </pre>
          </li>
          <li>
            Edit <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code> and set:
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
            </pre>
          </li>
          <li>
            Run the SQL in{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              supabase/schema.sql
            </code>{" "}
            in the Supabase SQL Editor.
          </li>
          <li>
            Restart the dev server:
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
              npm run dev
            </pre>
          </li>
        </ol>

        <p className="text-xs text-muted-foreground">
          Never commit <code>.env.local</code>. It is already listed in{" "}
          <code>.gitignore</code>. Do not put the service role key in any{" "}
          <code>NEXT_PUBLIC_*</code> variable.
        </p>
      </div>
    </div>
  );
}
