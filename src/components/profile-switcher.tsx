"use client";

import { useState } from "react";
import { Check, Plus, Trash2, ChevronsUpDown, UserPlus } from "lucide-react";
import { useProfiles, EMOJIS } from "@/lib/profiles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ProfileSwitcher({ compact = false }: { compact?: boolean }) {
  const { profiles, activeId, switchTo, create, remove } = useProfiles();
  const active = profiles.find((p) => p.id === activeId);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  function addProfile() {
    if (!name.trim()) return;
    create(name, emoji);
    setName("");
    setEmoji(EMOJIS[0]);
    setAdding(false);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2.5 rounded-xl border bg-card/60 px-3 py-2 text-left transition-colors hover:bg-card",
          compact ? "" : "w-full"
        )}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-lg">{active?.emoji ?? "🦊"}</span>
        {!compact && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{active?.name ?? "You"}</span>
            <span className="block text-[11px] text-muted-foreground">Switch profile</span>
          </span>
        )}
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Who&apos;s studying?</DialogTitle>
            <DialogDescription>Each profile keeps its own progress, XP and streak — all on this device.</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 py-1">
            {profiles.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-2.5",
                  p.id === activeId ? "border-primary/40 bg-primary/10" : "hover:bg-accent/40"
                )}
              >
                <button onClick={() => { switchTo(p.id); setOpen(false); }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-lg">{p.emoji}</span>
                  <span className="truncate font-medium">{p.name}</span>
                  {p.id === activeId && <Check className="size-4 text-primary" />}
                </button>
                {profiles.length > 1 && (
                  <button
                    onClick={() => { if (confirm(`Delete profile "${p.name}" and its progress? This can't be undone.`)) remove(p.id); }}
                    className="text-muted-foreground/60 hover:text-destructive"
                    title="Delete profile"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {adding ? (
            <div className="rounded-xl border p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={cn("grid size-8 place-items-center rounded-lg text-lg", emoji === e ? "bg-primary/20 ring-1 ring-primary/40" : "bg-muted hover:bg-accent")}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Profile name" autoFocus onKeyDown={(e) => e.key === "Enter" && addProfile()} />
                <button onClick={addProfile} disabled={!name.trim()} className="shrink-0 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground"
            >
              <UserPlus className="size-4" /> New profile
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
