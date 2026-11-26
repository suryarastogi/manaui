/**
 * Card-art URL helpers.
 *
 * Scryfall serves every rendition of a card image at a parallel path on the
 * same CDN, so a caller holding only one URL (say the `normal` render) can
 * reach the others without another API call.
 */

const SCRYFALL_IMAGE =
  /^(https:\/\/cards\.scryfall\.io)\/(small|normal|large|png|art_crop|border_crop)\/(.+)\.(?:jpg|png)(\?.*)?$/;

export type ScryfallRendition =
  | 'small'
  | 'normal'
  | 'large'
  | 'png'
  | 'art_crop'
  | 'border_crop';

/**
 * Rewrite a Scryfall card image URL to another rendition, or null when the
 * URL isn't a recognisable Scryfall image (no art beats a broken image).
 */
export function scryfallImageUri(
  imageUri: string | null | undefined,
  rendition: ScryfallRendition,
): string | null {
  if (!imageUri) return null;
  const m = SCRYFALL_IMAGE.exec(imageUri);
  if (!m) return null;
  const ext = rendition === 'png' ? 'png' : 'jpg';
  return `${m[1]}/${rendition}/${m[3]}.${ext}${m[4] ?? ''}`;
}

/** The illustration-only crop (no frame) for a Scryfall card image. */
export function artCropUri(imageUri: string | null | undefined): string | null {
  return scryfallImageUri(imageUri, 'art_crop');
}
