# @manaui/core

Framework-free Magic: The Gathering helpers: a Scryfall-shaped `Card` type, mana cost parsing,
card art URLs, type-line grouping, and the timing logic behind
[manaui](https://suryarastogi.github.io/manaui/)'s card previews. No dependencies, no React.

```bash
npm install @manaui/core
```

```ts
import { artCropUri, cardManaCost, groupByKind, parseManaCost, primaryKind } from '@manaui/core';

parseManaCost('{2}{W}{B/R}');             // ['2', 'w', 'br']
primaryKind('Artifact Creature — Golem'); // 'Creature'
artCropUri('https://cards.scryfall.io/normal/front/a/b/abc.jpg');
// 'https://cards.scryfall.io/art_crop/front/a/b/abc.jpg'
```

Full reference: https://suryarastogi.github.io/manaui/docs/core

Changelog: https://github.com/suryarastogi/manaui/blob/main/packages/core/CHANGELOG.md

## License

MIT. manaui is unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy.
Not approved or endorsed by Wizards.
