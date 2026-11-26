import { act, fireEvent, render, screen } from '@testing-library/react';
import { PEEK_COUNTDOWN_MS } from '@manaui/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { solRing, textOnly } from '../../../../test/cards';
import { CardPeek } from '../card-peek';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const phase = () => screen.getByTestId('card-peek').dataset.phase;

describe('CardPeek', () => {
  it('opens on the text with the ring spinning while the image loads', () => {
    render(<CardPeek card={solRing} />);
    expect(phase()).toBe('loading');
    expect(screen.getByTestId('card-peek')).toHaveTextContent('Sol Ring');
    expect(screen.getByTestId('card-peek')).toHaveTextContent('{T}: Add {C}{C}.');
    expect(screen.getByTestId('card-peek-ring')).toBeDisabled();
    // The image is mounted from the start: that is the background download.
    expect(screen.getByTestId('card-peek-image')).toHaveClass('opacity-0');
  });

  it('counts down once loaded, then reveals the image', () => {
    render(<CardPeek card={solRing} />);
    fireEvent.load(screen.getByTestId('card-peek-image'));
    expect(phase()).toBe('countdown');

    act(() => {
      vi.advanceTimersByTime(PEEK_COUNTDOWN_MS - 1);
    });
    expect(phase()).toBe('countdown');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(phase()).toBe('image');
    expect(screen.getByTestId('card-peek-image')).toHaveClass('opacity-100');
  });

  it('a touch on the text holds the countdown until the ring is tapped', () => {
    render(<CardPeek card={solRing} />);
    fireEvent.load(screen.getByTestId('card-peek-image'));
    fireEvent.pointerDown(screen.getByText('{T}: Add {C}{C}.'));
    expect(phase()).toBe('held');

    act(() => {
      vi.advanceTimersByTime(PEEK_COUNTDOWN_MS * 3);
    });
    expect(phase()).toBe('held');

    fireEvent.click(screen.getByTestId('card-peek-ring'));
    expect(phase()).toBe('image');
  });

  it('"Text" returns from the image and stays there', () => {
    render(<CardPeek card={solRing} />);
    fireEvent.load(screen.getByTestId('card-peek-image'));
    fireEvent.click(screen.getByTestId('card-peek-ring'));
    fireEvent.click(screen.getByTestId('card-peek-text'));
    expect(phase()).toBe('held');
  });

  it('tapping the revealed image closes', () => {
    const onClose = vi.fn();
    render(<CardPeek card={solRing} onClose={onClose} />);
    fireEvent.load(screen.getByTestId('card-peek-image'));
    fireEvent.click(screen.getByTestId('card-peek-ring'));
    fireEvent.click(screen.getByTestId('card-peek-image'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('is text-only when the card has no image or the image fails', () => {
    const { unmount } = render(<CardPeek card={textOnly} />);
    expect(phase()).toBe('text');
    expect(screen.queryByTestId('card-peek-ring')).toBeNull();
    unmount();

    render(<CardPeek card={solRing} />);
    fireEvent.error(screen.getByTestId('card-peek-image'));
    expect(phase()).toBe('text');
    expect(screen.getByTestId('card-peek')).toHaveTextContent('Card image unavailable');
  });
});
