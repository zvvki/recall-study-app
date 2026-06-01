import { cn } from "@/lib/utils";

export function tokenColor(token: string) {
  return `var(--${token})`;
}

/** confidence → semantic colour token */
export function confToken(c: number) {
  if (c >= 75) return "chart-3"; // strong (green)
  if (c >= 50) return "chart-2"; // ok (blue)
  if (c >= 30) return "chart-4"; // shaky (amber)
  return "chart-5"; // weak (red)
}

export function confLabel(c: number) {
  if (c >= 75) return "Strong";
  if (c >= 50) return "Solid";
  if (c >= 30) return "Shaky";
  return "Weak";
}

export function RingProgress({
  value,
  size = 132,
  stroke = 12,
  token = "chart-1",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  token?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tokenColor(token)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Sparkline({
  points,
  width = 240,
  height = 56,
  token = "chart-1",
}: {
  points: number[];
  width?: number;
  height?: number;
  token?: string;
}) {
  if (points.length === 0) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = max - min || 1;
  const step = width / Math.max(1, points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / span) * (height - 6) - 3;
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const id = `g-${token}`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tokenColor(token)} stopOpacity="0.35" />
          <stop offset="100%" stopColor={tokenColor(token)} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={tokenColor(token)} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function MiniBars({
  data,
}: {
  data: { label: string; value: number; token: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-28 items-end gap-1.5">
      {data.map((d, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-sm transition-all duration-500"
              style={{ height: `${(d.value / max) * 100}%`, background: tokenColor(d.token), minHeight: d.value ? 4 : 0 }}
              title={`${d.value}`}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ConfidenceBar({ value, token }: { value: number; token?: string }) {
  const t = token ?? confToken(value);
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.max(2, value)}%`, background: tokenColor(t) }}
      />
    </div>
  );
}

export function Dot({ token, className }: { token: string; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2.5 rounded-full", className)}
      style={{ background: tokenColor(token) }}
    />
  );
}
