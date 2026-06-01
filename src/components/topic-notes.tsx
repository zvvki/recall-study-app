"use client";

import { useState } from "react";
import { Lightbulb, ChevronDown, TriangleAlert, Sparkles } from "lucide-react";
import { NOTES, type NoteBlock } from "@/lib/notes";

/** Render **bold** spans inside note text. */
function Inline({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-foreground">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function Block({ block }: { block: NoteBlock }) {
  switch (block.t) {
    case "gist":
      return (
        <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-[15px] leading-relaxed">
            <Inline text={block.text} />
          </p>
        </div>
      );
    case "p":
      return (
        <p className="text-sm leading-relaxed text-muted-foreground">
          <Inline text={block.text} />
        </p>
      );
    case "points":
      return (
        <ul className="space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" />
              <span>
                <Inline text={it} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "rule":
      return (
        <div className="rounded-xl border border-chart-2/25 bg-chart-2/5 p-4">
          {block.label && (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-chart-2">
              <Sparkles className="size-3.5" /> {block.label}
            </div>
          )}
          <pre className="whitespace-pre-wrap font-mono text-[13.5px] leading-relaxed text-foreground/90">
            {block.text}
          </pre>
        </div>
      );
    case "trap":
      return (
        <div className="flex gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4">
          <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-warning" />
          <p className="text-sm leading-relaxed text-foreground/90">
            <span className="font-medium text-warning">Watch out: </span>
            <Inline text={block.text} />
          </p>
        </div>
      );
  }
}

export function TopicNotes({ topicId }: { topicId: string }) {
  const blocks = NOTES[topicId];
  const [open, setOpen] = useState(true);
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border bg-card/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-4 sm:p-5"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="size-4 text-primary" /> In plain English
        </span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-3 px-4 pb-5 sm:px-5">{blocks.map((b, i) => <Block key={i} block={b} />)}</div>}
    </div>
  );
}
