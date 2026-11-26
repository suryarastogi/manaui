import { describe, expect, it } from 'vitest';

import { panelAnchor, shouldShowImage } from '../src';

describe('shouldShowImage', () => {
  it('never shows an image for text-only cards', () => {
    expect(
      shouldShowImage({ hasImage: false, cached: true, loaded: true, dwellElapsed: true }),
    ).toBe(false);
  });

  it('shows immediately when the image was cached at open', () => {
    expect(
      shouldShowImage({ hasImage: true, cached: true, loaded: false, dwellElapsed: false }),
    ).toBe(true);
  });

  it('keeps the summary until BOTH the load and the dwell finish', () => {
    expect(
      shouldShowImage({ hasImage: true, cached: false, loaded: true, dwellElapsed: false }),
    ).toBe(false);
    expect(
      shouldShowImage({ hasImage: true, cached: false, loaded: false, dwellElapsed: true }),
    ).toBe(false);
    expect(
      shouldShowImage({ hasImage: true, cached: false, loaded: true, dwellElapsed: true }),
    ).toBe(true);
  });
});

describe('panelAnchor', () => {
  const viewport = { width: 1280, height: 800 };

  it('opens below the trigger when there is room', () => {
    const anchor = panelAnchor({ top: 100, bottom: 120, left: 40 }, viewport);
    expect(anchor).toEqual({ left: 40, top: 124, bottom: null });
  });

  it('flips above for triggers near the bottom', () => {
    const anchor = panelAnchor({ top: 700, bottom: 720, left: 40 }, viewport);
    expect(anchor.top).toBeNull();
    expect(anchor.bottom).toBe(800 - 700 + 4);
  });

  it('still opens below when there is even less room above', () => {
    const anchor = panelAnchor({ top: 10, bottom: 30, left: 40 }, viewport);
    expect(anchor.top).toBe(34);
    expect(anchor.bottom).toBeNull();
  });

  it('clamps the left edge into the viewport on both sides', () => {
    expect(panelAnchor({ top: 100, bottom: 120, left: -20 }, viewport).left).toBe(8);
    expect(panelAnchor({ top: 100, bottom: 120, left: 1270 }, viewport).left).toBe(
      1280 - 256 - 8,
    );
  });

  it('honours custom panel dimensions', () => {
    const anchor = panelAnchor({ top: 500, bottom: 520, left: 1270 }, viewport, {
      clearance: 100,
      width: 400,
      gap: 10,
      margin: 16,
    });
    expect(anchor).toEqual({ left: 1280 - 400 - 16, top: 530, bottom: null });
  });
});
