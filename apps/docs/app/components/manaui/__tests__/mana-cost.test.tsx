import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ColorIdentity, ManaCost, ManaSymbol } from '../mana-cost';

describe('ManaCost', () => {
  it('separates modal faces with //', () => {
    const { container } = render(<ManaCost cost="{2}{R} // {R}" />);
    expect(container.textContent).toBe('//');
    expect(container.querySelectorAll('i.ms')).toHaveLength(3);
  });

  it('single-face costs render no separator', () => {
    const { container } = render(<ManaCost cost="{2}{W}{U}" />);
    expect(container.textContent).toBe('');
    expect(container.querySelectorAll('i.ms')).toHaveLength(3);
  });

  it('maps hybrid symbols to mana-font classes', () => {
    const { container } = render(<ManaCost cost="{1}{G/W}" />);
    expect(container.querySelector('i.ms-gw')).not.toBeNull();
  });

  it('renders nothing for an empty or symbol-less cost', () => {
    expect(render(<ManaCost cost={null} />).container.firstChild).toBeNull();
    expect(render(<ManaCost cost="" />).container.firstChild).toBeNull();
    expect(render(<ManaCost cost="free" />).container.firstChild).toBeNull();
  });
});

describe('ColorIdentity', () => {
  it('orders pips WUBRG and labels them', () => {
    const { getByTestId } = render(<ColorIdentity colors={['G', 'w', 'U']} />);
    const el = getByTestId('color-identity');
    expect(el).toHaveAccessibleName('Color identity: White, Blue, Green');
    expect([...el.querySelectorAll('i')].map((i) => i.className)).toEqual([
      'ms ms-w ms-cost ms-fw',
      'ms ms-u ms-cost ms-fw',
      'ms ms-g ms-cost ms-fw',
    ]);
  });

  it('shows the colorless pip for an empty identity', () => {
    const { getByTestId } = render(<ColorIdentity colors={[]} />);
    expect(getByTestId('color-identity')).toHaveAccessibleName('Color identity: Colorless');
    expect(getByTestId('color-identity').querySelector('i.ms-c')).not.toBeNull();
  });
});

describe('ManaSymbol', () => {
  it('accepts Scryfall-style braces and slashes', () => {
    const { container } = render(<ManaSymbol symbol="{B/R}" />);
    expect(container.querySelector('i.ms-br')).not.toBeNull();
  });
});
