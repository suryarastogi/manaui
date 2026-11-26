import { act, fireEvent, render, screen } from '@testing-library/react';
import { IMAGE_DWELL_MS } from '@manaui/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { atraxa, solRing, textOnly } from '../../../../test/cards';
import { CardHover, CardName } from '../card-hover';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function preloader(): HTMLImageElement {
  const img = screen.getByTestId('card-hover-panel').querySelector('img.hidden');
  if (!img) throw new Error('no hidden preloader image');
  return img as HTMLImageElement;
}

describe('CardHover', () => {
  it('renders children untouched when there is nothing to preview', () => {
    render(<CardHover card={null}>Mystery</CardHover>);
    expect(screen.queryByTestId('card-hover-trigger')).toBeNull();
    expect(screen.getByText('Mystery')).toBeInTheDocument();
  });

  it('opens on the summary, then swaps to the image after load AND dwell', () => {
    render(<CardHover card={atraxa}>Atraxa</CardHover>);
    fireEvent.click(screen.getByTestId('card-hover-trigger'));

    const panel = screen.getByTestId('card-hover-panel');
    expect(panel).toHaveTextContent('Legendary Creature — Phyrexian Angel Horror');
    expect(panel).toHaveTextContent('proliferate');
    expect(screen.queryByTestId('card-hover-image')).toBeNull();

    // Loaded, but the summary hasn't been readable for the dwell yet.
    fireEvent.load(preloader());
    expect(screen.queryByTestId('card-hover-image')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(IMAGE_DWELL_MS);
    });
    expect(screen.getByTestId('card-hover-image')).toHaveAttribute(
      'src',
      atraxa.image_uris!.normal,
    );
  });

  it('snaps straight to the image on re-open once it loaded this session', () => {
    render(<CardHover card={solRing}>Sol Ring</CardHover>);
    const trigger = screen.getByTestId('card-hover-trigger');

    fireEvent.click(trigger);
    fireEvent.load(preloader());
    fireEvent.click(trigger); // unpin + close
    expect(screen.queryByTestId('card-hover-panel')).toBeNull();

    fireEvent.click(trigger);
    expect(screen.getByTestId('card-hover-image')).toBeInTheDocument();
  });

  it('stays on the summary and says so when the image fails', () => {
    render(<CardHover card={{ ...atraxa, name: 'Broken', image_uris: { normal: 'https://cards.scryfall.io/normal/front/b/r/broken.jpg' } }}>Broken</CardHover>);
    fireEvent.click(screen.getByTestId('card-hover-trigger'));
    fireEvent.error(preloader());
    act(() => {
      vi.advanceTimersByTime(IMAGE_DWELL_MS);
    });
    expect(screen.queryByTestId('card-hover-image')).toBeNull();
    expect(screen.getByTestId('card-hover-panel')).toHaveTextContent('Card image unavailable');
  });

  it('closes on Escape, an outside press, and scroll', () => {
    render(<CardHover card={textOnly}>Playtest</CardHover>);
    const trigger = screen.getByTestId('card-hover-trigger');

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('card-hover-panel')).toBeNull();

    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByTestId('card-hover-panel')).toBeNull();

    fireEvent.click(trigger);
    fireEvent.scroll(window);
    expect(screen.queryByTestId('card-hover-panel')).toBeNull();
  });

  it('shows a placeholder panel while the card is loading', () => {
    render(
      <CardHover card={undefined} loading>
        Loading card
      </CardHover>,
    );
    fireEvent.click(screen.getByTestId('card-hover-trigger'));
    expect(screen.getByTestId('card-hover-panel')).toHaveTextContent('Peeking at the card');
  });
});

describe('CardName', () => {
  it('degrades to plain text without a card', () => {
    render(<CardName card={null} name="Not A Card" />);
    expect(screen.getByText('Not A Card')).toBeInTheDocument();
    expect(screen.queryByTestId('card-hover-trigger')).toBeNull();
  });

  it('can show the mana cost after the name', () => {
    render(<CardName card={solRing} showCost />);
    expect(screen.getByLabelText('Mana cost {1}')).toBeInTheDocument();
  });
});
