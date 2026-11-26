import { describe, expect, it } from 'vitest';

import {
  groupByKind,
  isPlausibleCardName,
  kindRank,
  primaryKind,
  rarityRank,
  stapleTier,
} from '../src';

describe('isPlausibleCardName', () => {
  it('accepts real card-name shapes', () => {
    expect(isPlausibleCardName('Sol Ring')).toBe(true);
    expect(isPlausibleCardName("Atraxa, Praetors' Voice")).toBe(true);
    expect(isPlausibleCardName('Borrowing 100,000 Arrows')).toBe(true);
    expect(isPlausibleCardName('"Ach! Hans, Run!"')).toBe(true);
  });

  it('rejects bolded prose and markup', () => {
    expect(isPlausibleCardName('never do this')).toBe(false);
    expect(
      isPlausibleCardName('The plan here is to keep your mana open every single turn'),
    ).toBe(false);
    expect(isPlausibleCardName('One two three four five six seven eight nine')).toBe(false);
    expect(isPlausibleCardName('Weird **nested** emphasis')).toBe(false);
    expect(isPlausibleCardName('A')).toBe(false);
    expect(isPlausibleCardName('')).toBe(false);
  });
});

describe('primaryKind', () => {
  it('classifies by precedence, not position', () => {
    expect(primaryKind('Artifact Creature — Golem')).toBe('Creature');
    expect(primaryKind('Basic Land — Forest')).toBe('Land');
    expect(primaryKind('Legendary Enchantment Artifact')).toBe('Artifact');
    expect(primaryKind('Tribal Instant — Faerie')).toBe('Instant');
  });

  it('uses only the front face and falls back to Other', () => {
    expect(primaryKind('Creature — Giant // Instant — Adventure')).toBe('Creature');
    expect(primaryKind('Sorcery // Land')).toBe('Sorcery');
    expect(primaryKind(null)).toBe('Other');
    expect(primaryKind('Conspiracy')).toBe('Other');
  });

  it('ranks kinds with lands last and Other after everything', () => {
    expect(kindRank('Creature')).toBe(0);
    expect(kindRank('Land')).toBeGreaterThan(kindRank('Battle'));
    expect(kindRank('Other')).toBeGreaterThan(kindRank('Land'));
  });
});

describe('stapleTier', () => {
  it('tiers by EDHREC rank', () => {
    expect(stapleTier(1)).toBe('staple');
    expect(stapleTier(1000)).toBe('staple');
    expect(stapleTier(1001)).toBeNull();
    expect(stapleTier(20000)).toBeNull();
    expect(stapleTier(20001)).toBe('deep-cut');
    expect(stapleTier(null)).toBeNull();
    expect(stapleTier(undefined)).toBeNull();
  });
});

describe('rarityRank', () => {
  it('orders rarities and sorts unknown last', () => {
    expect(rarityRank('Common')).toBeLessThan(rarityRank('mythic'));
    expect(rarityRank('nonsense')).toBeGreaterThan(rarityRank('bonus'));
    expect(rarityRank(null)).toBe(rarityRank('nonsense'));
  });
});

describe('groupByKind', () => {
  it('groups in kind order, keeps item order, and drops empty groups', () => {
    const items = [
      { name: 'Forest', type: 'Basic Land — Forest' },
      { name: 'Sol Ring', type: 'Artifact' },
      { name: 'Llanowar Elves', type: 'Creature — Elf Druid' },
      { name: 'Mystery', type: null },
      { name: 'Golem', type: 'Artifact Creature — Golem' },
    ];
    const groups = groupByKind(items, (i) => i.type);
    expect(groups.map((g) => [g.label, g.items.map((i) => i.name)])).toEqual([
      ['Creatures', ['Llanowar Elves', 'Golem']],
      ['Artifacts', ['Sol Ring']],
      ['Lands', ['Forest']],
      ['Other', ['Mystery']],
    ]);
  });
});
