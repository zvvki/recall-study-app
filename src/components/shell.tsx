"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Brain,
  Timer,
  CalendarRange,
  LineChart,
  Flame,
  GraduationCap,
  BookOpen,
  ListChecks,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { streakInfo } from "@/lib/selectors";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learning", label: "Learning", icon: BookOpen },
  { href: "/recall", label: "Recall", icon: Brain },
  { href: "/quiz", label: "Quizzes", icon: ListChecks },
  { href: "/test", label: "Mock Test", icon: ClipboardCheck },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/subjects", label: "Subjects", icon: Layers },
  { href: "/planner", label: "Planner", icon: CalendarRange },
  { href: "/progress", label: "Progress", icon: LineChart },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold">
      <span className="grid size-9 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
        <GraduationCap className="size-5 text-primary" />
      </span>
      {!compact && (
        <span className="text-[17px] tracking-tight">
          Recall<span className="text-primary">.</span>
        </span>
      )}
    </Link>
  );
}

function StreakChip() {
  const state = useStore();
  const s = streakInfo(state);
  return (
    <div className="rounded-xl border bg-card/60 p-3">
      <div className="flex items-center gap-2">
        <Flame className={cn("size-4", s.current > 0 ? "text-warning" : "text-muted-foreground")} />
        <span className="text-sm font-medium">{s.current}-day streak</span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        {s.week.map((w, i) => (
          <span
            key={i}
            title={w.date}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              w.active ? "bg-warning" : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        {s.studiedToday
          ? "Logged today — nice."
          : s.atRisk
            ? "One session keeps it alive."
            : "A single card today restarts it."}
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-svh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar/70 glass px-4 py-5 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-foreground ring-1 ring-primary/25"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("size-4.5", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <StreakChip />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 glass px-4 py-3 lg:hidden">
        <Logo />
      </header>

      {/* Main */}
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t bg-background/90 glass lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[4.25rem] flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
