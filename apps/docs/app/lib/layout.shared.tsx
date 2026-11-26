import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 font-semibold">
          <i className="ms ms-c ms-cost ms-shadow text-[15px]" aria-hidden />
          {appName}
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
