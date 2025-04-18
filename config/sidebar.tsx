import { BookOpen, Code, FileCode, Rocket } from 'lucide-react';

export const sidebarNav = [
  {
    title: 'Getting Started',
    icon: <Rocket className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      {
        title: 'Introduction',
        href: '/docs/getting-started/introduction',
      },
      {
        title: 'Installation',
        href: '/docs/getting-started/installation',
      },
      {
        title: 'Quick Start',
        href: '/docs/getting-started/quick-start',
      },
    ],
  },
  {
    title: 'API Reference',
    icon: <Code className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      {
        title: 'Overview',
        href: '/docs/api/overview',
      },
      {
        title: 'Authentication',
        href: '/docs/api/authentication',
      },
      {
        title: 'Endpoints',
        href: '/docs/api/endpoints',
      },
    ],
  },
];
