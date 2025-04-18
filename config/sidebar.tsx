import { Component, Paintbrush, Rocket, Search, Wrench } from 'lucide-react';

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
    title: 'Components',
    icon: <Component className="h-5 w-5" />,
    defaultOpen: false,
    pages: [
      {
        title: 'Button',
        href: '/docs/components/button',
      },
      {
        title: 'Search Button',
        href: '/docs/components/search-button',
      },
      {
        title: 'Tabs',
        href: '/docs/components/tabs',
      },
      {
        title: 'Sidebar',
        href: '/docs/components/sidebar',
      },
      {
        title: 'Steps',
        href: '/docs/components/steps',
      },
      {
        title: 'Syntax Highlighter',
        href: '/docs/components/syntax-highlighter',
      },
      {
        title: 'Folder Tree',
        href: '/docs/components/folder-tree',
      },
      {
        title: 'Note',
        href: '/docs/components/note',
      },
      {
        title: 'Menu',
        href: '/docs/components/menu',
      },
      {
        title: 'Popover',
        href: '/docs/components/popover',
      },
      {
        title: 'Dialog',
        href: '/docs/components/dialog',
      },
      {
        title: 'Select',
        href: '/docs/components/select',
      },
    ],
  },
  {
    title: 'Customization',
    icon: <Wrench className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      {
        title: 'Sidebar',
        href: '/docs/customization/sidebar',
      },
      {
        title: 'Toc',
        href: '/docs/customization/toc',
      },
      {
        title: 'Font',
        href: '/docs/customization/font',
      },
      {
        title: 'SEO and Social Sharing',
        href: '/docs/customization/seo-and-social-sharing',
      },
    ],
  },
  {
    title: 'Theme',
    icon: <Paintbrush className="h-5 w-5" />,
    defaultOpen: true,
    href: '/docs/theme',
    pages: [],
  },
  {
    title: 'Search Bar',
    icon: <Search className="h-5 w-5" />,
    defaultOpen: true,
    href: '/docs/search-bar',
    pages: [],
  },
];
