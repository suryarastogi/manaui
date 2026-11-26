import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link } from 'react-router';

import { baseOptions } from '@/lib/layout.shared';

export function meta() {
  return [
    { title: 'manaui · Magic: The Gathering components for React' },
    {
      name: 'description',
      content:
        'Open-source card previews, mana symbols and deck-list rows for Magic: The Gathering apps. Copy them into your project with the shadcn CLI.',
    },
  ];
}

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight">manaui</h1>
        <p className="mb-6 max-w-md text-fd-muted-foreground">
          Card previews, mana symbols and deck-list rows for Magic: The Gathering apps.
        </p>
        <Link
          className="rounded-full bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground"
          to="/docs"
        >
          Browse the components
        </Link>
      </div>
    </HomeLayout>
  );
}
