"use client";

interface StatsBarProps {
  total: number;
}

export default function StatsBar({ total }: StatsBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-6 min-w-[40px] items-center justify-center rounded-lg bg-yc-focus/10 px-2 font-mono text-xs font-medium text-yc-focus shadow-[inset_0_0_0_0.8px_rgba(73,119,240,0.4)]">
        {total.toLocaleString()}
      </span>
    </div>
  );
}
