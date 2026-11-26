import { describe, expect, it } from 'vitest';

import { parseManaCost, parseManaCostFaces, sortColors } from '../src';

describe('parseManaCost', () => {
  it('lowercases symbols and drops the slash from hybrids', () => {
    expect(parseManaCost('{2}{W}{B/R}')).toEqual(['2', 'w', 'br']);
    expect(parseManaCost('{X}{W/P}{2/U}')).toEqual(['x', 'wp', '2u']);
    expect(parseManaCost('')).toEqual([]);
  });
});

describe('parseManaCostFaces', () => {
  it('splits multi-face costs and drops costless faces', () => {
    expect(parseManaCostFaces('{2}{R} // {R}')).toEqual([['2', 'r'], ['r']]);
    expect(parseManaCostFaces('{1}{W/U}')).toEqual([['1', 'wu']]);
    expect(parseManaCostFaces('{U} // ')).toEqual([['u']]);
  });
});

describe('sortColors', () => {
  it('orders identity letters WUBRG and ignores anything else', () => {
    expect(sortColors(['g', 'W', 'u'])).toEqual(['W', 'U', 'G']);
    expect(sortColors(['R', 'R', 'C', 'x'])).toEqual(['R']);
    expect(sortColors(null)).toEqual([]);
  });
});
