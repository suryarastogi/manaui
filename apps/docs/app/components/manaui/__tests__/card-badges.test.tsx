import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KeywordChips, ProducedManaPips, RarityDot, StapleChip } from '../card-badges';

describe('RarityDot', () => {
  it('labels known rarities and skips unknown ones', () => {
    render(<RarityDot rarity="Mythic" />);
    expect(screen.getByRole('img', { name: 'Rarity: Mythic' })).toBeInTheDocument();
    expect(render(<RarityDot rarity="token" />).container.firstChild).toBeNull();
    expect(render(<RarityDot rarity={null} />).container.firstChild).toBeNull();
  });
});

describe('StapleChip', () => {
  it('shows a tier only at the extremes of EDHREC rank', () => {
    expect(render(<StapleChip edhrecRank={12} />).container.textContent).toBe('Staple');
    expect(render(<StapleChip edhrecRank={25000} />).container.textContent).toBe('Deep cut');
    expect(render(<StapleChip edhrecRank={5000} />).container.firstChild).toBeNull();
    expect(render(<StapleChip edhrecRank={undefined} />).container.firstChild).toBeNull();
  });
});

describe('ProducedManaPips', () => {
  it('shows what lands and artifacts tap for, in WUBRG+C order', () => {
    render(
      <ProducedManaPips
        card={{ name: 'Command Tower', type_line: 'Land', produced_mana: ['G', 'W', 'U'] }}
      />,
    );
    expect(screen.getByRole('img', { name: 'Produces W, U, G' })).toBeInTheDocument();
  });

  it('stays quiet on creatures unless asked', () => {
    const elf = { name: 'Llanowar Elves', type_line: 'Creature — Elf Druid', produced_mana: ['G'] };
    expect(render(<ProducedManaPips card={elf} />).container.firstChild).toBeNull();
    render(<ProducedManaPips card={elf} always />);
    expect(screen.getByRole('img', { name: 'Produces G' })).toBeInTheDocument();
  });
});

describe('KeywordChips', () => {
  it('caps the chips and counts the overflow', () => {
    const { container } = render(
      <KeywordChips keywords={['Flying', 'Vigilance', 'Deathtouch', 'Lifelink', 'Proliferate']} />,
    );
    expect(container.textContent).toBe('FlyingVigilanceDeathtouchLifelink+1');
  });
});
