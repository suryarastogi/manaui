/**
 * Phase logic for a card "peek" popup.
 *
 * The popup opens on the card's text at once, loads the image behind it,
 * and only then counts down (a ring filling) before the image replaces the
 * text. The countdown is the warning: nothing swaps under the reader
 * without a visible, finite cue first.
 */

/** How long the ring takes to fill once the image is ready. */
export const PEEK_COUNTDOWN_MS = 1600;

export type PeekPhase =
  /** No image to show (none known, or it failed): the text is the popup. */
  | 'text'
  /** Image still downloading: the ring spins, no end in sight yet. */
  | 'loading'
  /** Image ready: the ring fills, then the image takes over. */
  | 'countdown'
  /** Reader asked to stay on the text: the ring waits as a button. */
  | 'held'
  | 'image';

export interface PeekState {
  hasImage: boolean;
  failed: boolean;
  loaded: boolean;
  held: boolean;
  revealed: boolean;
}

export function peekPhase(state: PeekState): PeekPhase {
  if (!state.hasImage || state.failed) return 'text';
  if (!state.loaded) return 'loading';
  if (state.revealed) return 'image';
  return state.held ? 'held' : 'countdown';
}
