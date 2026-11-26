export const appName = 'manaui';
export const docsRoute = '/docs';

export const gitConfig = {
  user: 'suryarastogi',
  repo: 'manaui',
  branch: 'main',
};

/** Public origin + base path of the deployed site (no trailing slash). */
export const siteUrl = 'https://suryarastogi.github.io/manaui';

/** Where a registry item's JSON is served. */
export function registryUrl(name: string): string {
  return `${siteUrl}/r/${name}.json`;
}
