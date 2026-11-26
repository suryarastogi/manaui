/**
 * Compile-time check (run by `npm run typecheck`): every card the Scryfall
 * API can return is assignable to manaui's `Card`, so API responses can be
 * passed to components without mapping.
 */
import type { ScryfallCard } from '@scryfall/api-types';

import type { Card } from '../src';

type Assert<T extends true> = T;

export type AnyScryfallCardIsACard = Assert<ScryfallCard.Any extends Card ? true : false>;
