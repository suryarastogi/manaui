import { describe, expect, it } from 'vitest';

import { peekPhase } from '../src';

const base = { hasImage: true, failed: false, loaded: false, held: false, revealed: false };

describe('peekPhase', () => {
  it('stays on the text when there is no image or it failed', () => {
    expect(peekPhase({ ...base, hasImage: false, loaded: true, revealed: true })).toBe('text');
    expect(peekPhase({ ...base, failed: true })).toBe('text');
  });

  it('spins until the image has loaded, never revealing early', () => {
    expect(peekPhase(base)).toBe('loading');
    expect(peekPhase({ ...base, revealed: true })).toBe('loading');
  });

  it('counts down once loaded, then shows the image', () => {
    expect(peekPhase({ ...base, loaded: true })).toBe('countdown');
    expect(peekPhase({ ...base, loaded: true, revealed: true })).toBe('image');
  });

  it('a hold parks the countdown until the reader asks for the image', () => {
    expect(peekPhase({ ...base, loaded: true, held: true })).toBe('held');
    expect(peekPhase({ ...base, loaded: true, held: true, revealed: true })).toBe('image');
  });
});
