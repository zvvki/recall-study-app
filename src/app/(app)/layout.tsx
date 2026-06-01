"use client";

import { AppShell } from "@/components/shell";
import { useHydrated } from "@/lib/store";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  return (
    <AppShell>
      {hydrated ? (
        children
      ) : (
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
