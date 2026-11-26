# manaui: notes for agents

Open-source MTG React components, distributed as a shadcn registry plus the `@manaui/core` npm
package. Read `README.md` first for layout and commands.

## Rules that are easy to break

- **Registry components must stay copy-paste portable.** Files in `apps/docs/app/components/manaui`
  are shipped verbatim to other people's projects. They may import only: `react`, `react-dom`,
  `@manaui/core`, `lucide-react`, `@/lib/utils` (`cn`), `@/components/ui/dialog` (stock shadcn,
  Radix or Base UI), and each other via `@/components/manaui/*`. Nothing from the docs app.
- **Do not rely on global CSS the CLI might not deliver.** The shadcn CLI writes `@keyframes` from a
  registry item's `css` field inside Tailwind's `@theme`, where unused keyframes are dropped. The
  peek ring is animated with the Web Animations API for this reason. The only global rules shipped
  are the mana-font `@import` and the lightbox scrim.
- **The scrim selector uses `~`, not `+`.** Base UI renders a focus guard between the dialog overlay
  and the popup. `[data-slot='dialog-overlay']:has(~ [data-manaui-lightbox])` works for both Base UI
  and Radix. It lives in `registry.json` (two items) and `apps/docs/app/app.css`; keep them equal.
- **Stock dialog only.** Use `DialogContent` props that exist in shadcn's own dialog
  (`showCloseButton`, `className`, `data-*`). No custom props.
- **Cards are Scryfall-shaped.** Read card fields through the accessors in `@manaui/core`
  (`cardImage`, `cardManaCost`, …) so double-faced cards keep working.
- **Density switches on the `cards` container**, not the viewport. A container cannot query itself,
  so spacing between rows lives on the rows.
- **`@manaui/core` has zero dependencies and no DOM or React imports.** It builds with
  `isolatedDeclarations`, so exported functions need explicit return types.

## Verifying a change

```bash
npm run build:core && npm run typecheck && npm test && npm run build
npm run preview -w docs   # http://localhost:4173/manaui/
```

Look at the result at 390px and 1280px. To check the install path for real, scaffold a throwaway
project with `npx shadcn@latest init -t vite`, serve `apps/docs/build/client`, and
`npx shadcn@latest add http://localhost:4173/manaui/r/<item>.json`. Until a change to
`@manaui/core` is published, point the item's dependency at an `npm pack` tarball.

## Releasing

Merging to `main` releases. A pull request that changes `packages/core` must include a changeset
(`npm run changeset`, or write `.changeset/<name>.md` by hand) with the semver bump: `patch` for a
fix, `minor` for a new export, `major` for a breaking change. On merge the `Release` workflow
versions, commits to `main`, publishes to npm and tags, with no second pull request. Do not bump
`packages/core/package.json` or edit `CHANGELOG.md` yourself, and do not rename `release.yml`: npm's
trusted publisher is bound to that file name. Changes to the docs app or the registry need no
changeset.
