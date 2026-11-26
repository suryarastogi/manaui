/**
 * Where the site is mounted. GitHub Pages serves this repo at /manaui/;
 * set BASE_PATH=/ to build for a root domain.
 */
const raw = process.env.BASE_PATH ?? '/manaui/';

export const basePath: string = raw.endsWith('/') ? raw : `${raw}/`;
