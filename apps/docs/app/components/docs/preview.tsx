import * as React from 'react';

import { cn } from '@/lib/utils';

/** The framed stage a live component demo sits on. */
export function Preview({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'not-prose my-6 flex min-h-40 flex-wrap items-center justify-center gap-4 rounded-xl border bg-background p-6 text-sm text-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}

const WIDTHS = [
  { key: 'phone', label: 'Phone', width: 390 },
  { key: 'desktop', label: 'Desktop', width: null },
] as const;

type WidthKey = (typeof WIDTHS)[number]['key'];

/**
 * A stage whose width the reader can switch. The card rows respond to their
 * container, not the viewport, so this shows both densities on any screen.
 */
export function WidthPreview({
  initial = 'phone',
  children,
}: {
  initial?: WidthKey;
  children: React.ReactNode;
}) {
  const [active, setActive] = React.useState<WidthKey>(initial);
  const width = WIDTHS.find((w) => w.key === active)?.width ?? null;

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border bg-background text-sm text-foreground">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <span className="text-xs text-muted-foreground">Container width</span>
        <div className="flex gap-1" role="group" aria-label="Preview width">
          {WIDTHS.map((w) => (
            <button
              key={w.key}
              type="button"
              aria-pressed={active === w.key}
              onClick={() => setActive(w.key)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                active === w.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center p-4 sm:p-6">
        <div
          className="w-full transition-[max-width] duration-300"
          style={{ maxWidth: width ?? '100%' }}
          data-testid="width-preview-stage"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
