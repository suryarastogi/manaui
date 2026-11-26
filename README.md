# manaui

Open-source React components for Magic: The Gathering apps: card previews, mana symbols and
deck-list rows. They take [Scryfall](https://scryfall.com/docs/api) card objects, are styled with
Tailwind CSS, and are distributed the [shadcn/ui](https://ui.shadcn.com) way, so you copy the source
into your project and own it.

**Docs and live demos: https://suryarastogi.github.io/manaui/**

## Quick start

In a project set up with shadcn/ui and Tailwind CSS v4:

```bash
npx shadcn@latest add https://suryarastogi.github.io/manaui/r/card-list.json
```

```tsx
import { cardTypeLine, groupByKind } from '@manaui/core';
import { CardList } from '@/components/manaui/card-list';

export function Deck({ entries }) {
  const groups = groupByKind(entries, (entry) => cardTypeLine(entry.card)).map((group) => ({
    key: group.key,
    label: group.label,
    cards: group.items,
  }));
  return <CardList groups={groups} />;
}
```

## What is here

| Registry item | What it is |
| --- | --- |
| `card-hover` | Hover or tap a card name to preview it. Rules text first, then the image. |
| `card-peek` | A card popup that counts down to the image with a visible ring. |
| `card-art-row` | List rows that become thumb-sized art tiles on narrow containers. |
| `card-list` | Collapsible grouped rows wired to hover and peek. |
| `mana-cost` | Mana cost and color identity symbols. |
| `card-badges` | Rarity, staple, produced-mana and keyword chips. |

[`@manaui/core`](packages/core) is the dependency-free TypeScript package underneath: the Scryfall
card type, mana cost parsing, art-crop URLs and the timing rules behind the previews. It works
without React.

```bash
npm install @manaui/core
```

## Repository layout

```
packages/core            @manaui/core (published to npm)
apps/docs                Fumadocs site on React Router, prerendered to static files
  app/components/manaui  the registry components' source
  registry.json          the shadcn registry manifest
  content/docs           the documentation pages
```

The docs site and the registry are one deployment: `shadcn build` writes each item to
`apps/docs/public/r/<name>.json`, and GitHub Pages serves them next to the docs.

## Development

Requires Node 22 or newer.

```bash
npm install
npm run build:core   # build @manaui/core once; the docs app imports it
npm run dev          # docs with hot reload at http://localhost:5173/manaui/
npm test             # core unit tests and component tests
npm run typecheck
npm run build        # core, registry and the static docs site
npm run preview -w docs   # serve the static build the way GitHub Pages does
```

The site is built for the `/manaui/` path. Set `BASE_PATH=/` to build for a root domain.

When you change a registry component, keep three things in step: the component in
`apps/docs/app/components/manaui`, its entry in `apps/docs/registry.json` (dependencies and any
`css`), and its page in `apps/docs/content/docs/components`.

## Releasing

Docs and registry deploy from `main` by the `Deploy docs` workflow. Enable it once under
Settings → Pages → Source → GitHub Actions.

`@manaui/core` follows [semver](https://semver.org) and releases on merge: one pull request, one
version. A pull request that changes the package carries a
[changeset](https://github.com/changesets/changesets) saying how to bump it:

```bash
npm run changeset
```

Pick `patch` for a fix, `minor` for a new export and `major` for a breaking change, and write the
changelog line. CI fails a pull request that changes the package without one. When the pull request
merges, the `Release` workflow applies the changeset, commits the new version to `main`, publishes it
to npm, tags it and creates the GitHub release. There is no second pull request to merge. A merge
with no changeset, such as a docs change, releases nothing.

Publishing uses npm [trusted publishing](https://docs.npmjs.com/trusted-publishers), so the
repository stores no npm token. The trusted publisher is bound to the workflow file name
`release.yml`. The workflow pushes the version commit to `main` itself, so a branch protection rule
that requires pull requests has to exempt GitHub Actions.

## Fan content notice

manaui is unofficial Fan Content permitted under the
[Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy). Not approved or
endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast.
©Wizards of the Coast LLC.

Card data and images in the docs are provided by [Scryfall](https://scryfall.com). Mana symbols are
rendered with [mana-font](https://github.com/andrewgioia/mana).

## License

[MIT](LICENSE)
