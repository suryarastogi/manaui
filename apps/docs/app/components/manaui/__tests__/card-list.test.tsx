import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { atraxa, solRing, textOnly } from '../../../../test/cards';
import { CardArtRow, CardArtRows } from '../card-art-row';
import { CardList } from '../card-list';

describe('CardArtRow', () => {
  it('uses the art crop as decorative, lazy art', () => {
    render(
      <CardArtRows>
        <CardArtRow card={solRing} />
      </CardArtRows>,
    );
    const art = screen.getByTestId('card-art-row-art');
    expect(art).toHaveAttribute('src', solRing.image_uris!.art_crop);
    expect(art).toHaveAttribute('loading', 'lazy');
    expect(art).toHaveAttribute('alt', '');
  });

  it('derives the art crop from the normal render when needed', () => {
    render(
      <CardArtRows>
        <CardArtRow card={atraxa} />
      </CardArtRows>,
    );
    expect(screen.getByTestId('card-art-row-art')).toHaveAttribute(
      'src',
      'https://cards.scryfall.io/art_crop/front/a/t/atraxa.jpg?1',
    );
  });

  it('renders no art when there is none, or when it fails to load', () => {
    const { unmount } = render(
      <CardArtRows>
        <CardArtRow card={textOnly} />
      </CardArtRows>,
    );
    expect(screen.queryByTestId('card-art-row-art')).toBeNull();
    unmount();

    render(
      <CardArtRows>
        <CardArtRow card={solRing} />
      </CardArtRows>,
    );
    fireEvent.error(screen.getByTestId('card-art-row-art'));
    expect(screen.queryByTestId('card-art-row-art')).toBeNull();
  });

  it('shows quantity above one and calls onSelect from the tile target', () => {
    const onSelect = vi.fn();
    render(
      <CardArtRows>
        <CardArtRow card={solRing} quantity={3} onSelect={onSelect} />
      </CardArtRows>,
    );
    expect(screen.getByText('×3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show Sol Ring' }));
    expect(onSelect).toHaveBeenCalledWith(solRing);
  });
});

describe('CardList', () => {
  const groups = [
    { key: 'creatures', label: 'Creatures', cards: [{ card: atraxa }] },
    { key: 'artifacts', label: 'Artifacts', cards: [{ card: solRing, quantity: 2 }] },
  ];

  it('counts copies per group and collapses a group from its header', () => {
    render(<CardList groups={groups} />);
    const artifacts = screen.getByRole('region', { name: 'Artifacts' });
    expect(within(artifacts).getByRole('button', { name: /Artifacts · 2/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    fireEvent.click(within(artifacts).getByRole('button', { name: /Artifacts/ }));
    expect(within(artifacts).queryByText('Sol Ring')).toBeNull();
    // The other group is untouched.
    expect(screen.getByText("Atraxa, Praetors' Voice")).toBeInTheDocument();
  });

  it('forceOpen shows collapsed groups without forgetting them', () => {
    const { rerender } = render(<CardList groups={groups} />);
    fireEvent.click(screen.getByRole('button', { name: /Artifacts/ }));
    expect(screen.queryByText('Sol Ring')).toBeNull();

    rerender(<CardList groups={groups} forceOpen />);
    expect(screen.getByText('Sol Ring')).toBeInTheDocument();

    rerender(<CardList groups={groups} />);
    expect(screen.queryByText('Sol Ring')).toBeNull();
  });

  it('opens the shared peek dialog from a row', () => {
    render(<CardList groups={groups} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Sol Ring' }));
    expect(screen.getByTestId('card-peek')).toHaveTextContent('{T}: Add {C}{C}.');
  });
});
