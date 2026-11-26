/**
 * Is this phrase plausibly a Magic card name? A cheap syntactic gate for
 * "autocard" features that turn bolded text in prose or chat into card
 * previews, so `**never do this**` doesn't trigger a card lookup. False
 * positives are fine: the lookup misses once and the text stays plain.
 */
export function isPlausibleCardName(text: string): boolean {
  if (text.length < 2 || text.length > 50) return false;
  if (!/^[A-Z0-9"]/.test(text)) return false; // card names are capitalized
  if (/[*_`\n{}<>|]/.test(text)) return false; // markdown/artifact characters
  if (text.split(/\s+/).length > 8) return false;
  return true;
}
