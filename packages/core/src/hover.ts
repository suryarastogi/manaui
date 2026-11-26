/**
 * Decisions behind a hover/tap card preview: when the image may replace the
 * text summary, and where the floating panel goes.
 */

/** Keep the text summary readable this long before the image replaces it. */
export const IMAGE_DWELL_MS = 600;

export interface ImageRevealState {
  hasImage: boolean;
  /** The image had already loaded earlier this session when the panel opened. */
  cached: boolean;
  loaded: boolean;
  dwellElapsed: boolean;
}

/** Show the image instead of the summary? */
export function shouldShowImage(state: ImageRevealState): boolean {
  if (!state.hasImage) return false;
  if (state.cached) return true;
  return state.loaded && state.dwellElapsed;
}

export interface PanelAnchor {
  left: number;
  top: number | null;
  bottom: number | null;
}

export interface PanelAnchorOptions {
  /** Room the open panel needs below the trigger. Default fits a 224px-wide
   *  card image at the 488:680 card ratio plus a gap. */
  clearance?: number;
  /** Widest the panel gets, used to clamp against the right viewport edge. */
  width?: number;
  /** Gap between trigger and panel. */
  gap?: number;
  /** Minimum distance from the viewport's left and right edges. */
  margin?: number;
}

/**
 * Fixed-position anchor for a panel attached to a trigger rect. Opens below
 * the trigger unless it wouldn't fit, in which case it flips above (when
 * there is more room there); the left edge clamps into the viewport.
 */
export function panelAnchor(
  rect: { top: number; bottom: number; left: number },
  viewport: { width: number; height: number },
  options: PanelAnchorOptions = {},
): PanelAnchor {
  const { clearance = 340, width = 256, gap = 4, margin = 8 } = options;
  const roomBelow = viewport.height - rect.bottom;
  const up = roomBelow < clearance && rect.top > roomBelow;
  return {
    left: Math.max(margin, Math.min(rect.left, viewport.width - width - margin)),
    top: up ? null : rect.bottom + gap,
    bottom: up ? viewport.height - rect.top + gap : null,
  };
}
