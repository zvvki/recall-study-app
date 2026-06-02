"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/shell";
import { useHydrated } from "@/lib/store";
import { useProfiles } from "@/lib/profiles";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const ready = useProfiles((s) => s.ready);

  useEffect(() => {
    useProfiles.getState().init();
  }, []);

  return (
    <AppShell>
      {hydrated && ready ? (
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
