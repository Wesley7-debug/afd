"use client";

export default function Footer() {
  return (
    <footer className="border-t border-yc-line bg-yc-surface">
      <div className="mx-auto max-w-[1440px] px-8 py-6 max-md:px-4">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[13px] text-yc-ink-muted">
            African Founders &mdash; A public directory of founders building across Africa.
          </p>
          <p className="text-xs text-yc-ink-3">
            Data sourced from public information.
          </p>
        </div>
      </div>
    </footer>
  );
}
