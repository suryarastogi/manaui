/**
 * The card shape manaui works with: a structural subset of Scryfall's `Card`
 * object (https://scryfall.com/docs/api/cards). Anything fetched from the
 * Scryfall API can be passed straight in; every field except `name` is
 * optional so partial projections work too.
 */

import { artCropUri } from './art';

/** Scryfall's image renditions. */
export interface CardImageUris {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
  art_crop?: string;
  border_crop?: string;
}

export type CardImageSize = keyof CardImageUris;

/** One face of a multi-faced card (transform, modal DFC, split, adventure…). */
export interface CardFace {
  name: string;
  mana_cost?: string | null;
  type_line?: string | null;
  oracle_text?: string | null;
  image_uris?: CardImageUris | null;
}

export interface Card {
  name: string;
  /** e.g. `"{2}{W}{U}"`, or `"{2}{R} // {1}{R}"` for split/adventure cards. */
  mana_cost?: string | null;
  type_line?: string | null;
  oracle_text?: string | null;
  /** `common` | `uncommon` | `rare` | `mythic` | `special` | `bonus`. */
  rarity?: string | null;
  color_identity?: string[] | null;
  keywords?: string[] | null;
  /** Colours of mana this card can produce (`W`,`U`,`B`,`R`,`G`,`C`). */
  produced_mana?: string[] | null;
  edhrec_rank?: number | null;
  /** Missing on cards whose faces each carry their own image. */
  image_uris?: CardImageUris | null;
  card_faces?: CardFace[] | null;
}

function faceValues(
  card: Card,
  pick: (face: CardFace) => string | null | undefined,
): string[] {
  return (card.card_faces ?? []).map(pick).filter((v): v is string => !!v);
}

/**
 * The card's image at the given size. Falls back to the front face for
 * double-faced cards, which have no top-level `image_uris`.
 */
export function cardImage(
  card: Card | null | undefined,
  size: CardImageSize = 'normal',
): string | null {
  if (!card) return null;
  return card.image_uris?.[size] ?? card.card_faces?.[0]?.image_uris?.[size] ?? null;
}

/**
 * The illustration-only crop. Uses `art_crop` when present and otherwise
 * derives it from another Scryfall rendition (see `artCropUri`).
 */
export function cardArt(card: Card | null | undefined): string | null {
  if (!card) return null;
  return (
    cardImage(card, 'art_crop') ??
    artCropUri(cardImage(card, 'normal') ?? cardImage(card, 'large') ?? cardImage(card, 'small'))
  );
}

/** Mana cost, joining faces with `//` when only the faces carry one. */
export function cardManaCost(card: Card | null | undefined): string | null {
  if (!card) return null;
  if (card.mana_cost) return card.mana_cost;
  const faces = faceValues(card, (f) => f.mana_cost);
  return faces.length > 0 ? faces.join(' // ') : null;
}

/** Type line, joining faces with `//` when only the faces carry one. */
export function cardTypeLine(card: Card | null | undefined): string | null {
  if (!card) return null;
  if (card.type_line) return card.type_line;
  const faces = faceValues(card, (f) => f.type_line);
  return faces.length > 0 ? faces.join(' // ') : null;
}

/** Rules text. Multi-faced cards get each face's text under its name. */
export function cardOracleText(card: Card | null | undefined): string | null {
  if (!card) return null;
  if (card.oracle_text) return card.oracle_text;
  const faces = (card.card_faces ?? []).filter((f) => !!f.oracle_text);
  if (faces.length === 0) return null;
  return faces.map((f) => `${f.name}\n${f.oracle_text}`).join('\n\n');
}
