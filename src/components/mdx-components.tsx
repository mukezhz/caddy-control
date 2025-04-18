'use client';
import React from 'react';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import clsx from 'clsx';
import SearchButton from '@/components/search-button';
import Preview from '@/components/preview';
import { Tab, Tabs, TabsContent, TabsList } from '@/components/tabs';
import Link from 'next/link';
import CustomSyntaxHighlighter from '@/components/syntax-highlighter';
import Stepper from '@/components/vertical-stepper';
import { Step, Steps, StepTitle, StepContent } from '@/components/step';
import { Button } from '@/components/button';
import { Menu, MenuItem, MenuTrigger, PopMenu } from '@/components/menu';
import {
  NavMenu,
  NavMenuItem,
  NavMenuList,
  NavMenuTrigger,
  NavListItem,
  NavMenuContent,
} from '@/components/nav-menu';

import {
  PopoverContent,
  PopoverTrigger,
  Popover,
  PopoverClose,
} from '@/components/popover';

import {
  SidebarProvider,
  SidebarLayout,
  MainContent,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeaderLogo,
  SidebarHeaderTitle,
  UserAvatar,
  NestedLink,
} from '@/components/sidebar';
import {
  Home,
  Users,
  Settings,
  FileText,
  BarChart,
  Mail,
  Bell,
  BookOpen,
  Component,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/select';
import {
  DialogCloseTrigger,
  DialogContent,
  DialogTrigger,
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/dialog';

import { Folder, FolderTree, File } from '@/components/folder-tree';
import { Note } from '@/components/note';

const components = {
  h1: ({ className, ...children }: React.HTMLAttributes<HTMLElement>) => (
    <h1
      className={`text-3xl font-semibold mt-3 mb-3 ${className}`}
      {...children}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    return (
      <Link
        href={`#${props.id}`}
        className={'cursor-pointer group relative items-center w-fit'}
      >
        <h1
          className={`flex text-2xl hover:underline font-semibold mt-8 mb-4 gap-1 ${className}`}
          {...props}
        >
          {props.children}
          <span className="text-2xl text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            #
          </span>
        </h1>
      </Link>
    );
  },
  h3: ({ className, ...children }: React.HTMLAttributes<HTMLElement>) => (
    <h3
      className={`text-xl font-semibold mt-6 mb-3 ${className}`}
      {...children}
    />
  ),
  h4: ({ className, ...children }: React.HTMLAttributes<HTMLElement>) => (
    <h4
      className={`text-lg font-semibold mt-6 mb-3 ${className}`}
      {...children}
    />
  ),
  p: ({ className, ...children }: React.HTMLAttributes<HTMLElement>) => (
    <p className={`my-4 leading-7 ${className}`} {...children} />
  ),
  a: ({ className, ...children }: React.HTMLAttributes<HTMLElement>) => (
    <a
      className={`text-primary underline underline-offset-4 ${className}`}
      {...children}
    />
  ),
  ul: ({ className, ...children }: React.HTMLAttributes<HTMLElement>) => (
    <ul className={`list-disc pl-6 my-4 ${className}`} {...children} />
  ),
  ol: ({ className, ...children }: React.HTMLAttributes<HTMLElement>) => (
    <ol className={`list-decimal pl-6 my-4 ${className}`} {...children} />
  ),
  li: ({ className, ...children }: React.HTMLAttributes<HTMLElement>) => (
    <li className={`mb-2 ${className}`} {...children} />
  ),
  blockquote: ({
    className,
    ...children
  }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={`border-l-4 border-muted-foreground pl-4 italic my-4 ${className}`}
      {...children}
    />
  ),
  hr: ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className={`my-4 md:my-8 ${className}`} {...props} />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto">
      <table
        className={clsx(
          'w-full text-sm border-collapse border rounded-lg outline-1 outline-border outline-offset-[-1px] overflow-hidden',
          className
        )}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={clsx('border', className)} {...props} />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={clsx(
        'border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={clsx(
        'border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  code: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => {
    const isLightMode = 'dark';

    // Extract language from className (e.g., `language-js` → `js`)
    const match = className?.match(/language-(\w+)/);
    const language = match ? match[1] : 'plaintext';

    const extractText = (children: React.ReactNode): string => {
      if (typeof children === 'string') return children;
      if (Array.isArray(children)) return children.map(extractText).join('');
      if (React.isValidElement(children))
        return extractText((children.props as any)?.children || '');
      return '';
    };

    if (language !== 'plaintext') {
      return (
        <CustomSyntaxHighlighter
          tabs={{
            [language]: { syntax: extractText(children) as string, language },
          }}
          themeMode={isLightMode}
          indicatorColor="bg-blue-900"
        />
      );
    } else {
      return (
        <code
          className={clsx(
            'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
            className
          )}
          {...props}
        >
          {' '}
          {children}
        </code>
      );
    }
  },
  // Add your globally available components:
  Preview,
  SearchButton,
  CustomSyntaxHighlighter,
  Tabs,
  TabsList,
  Tab,
  TabsContent,
  Button,
  Step,
  Steps,
  StepTitle,
  StepContent,
  Stepper,
  CodeTabs: ({
    tabs,
  }: React.HTMLAttributes<HTMLElement> & {
    tabs: Record<string, { syntax: string; language: string }>;
  }) => {
    const isLightMode = 'dark';

    return (
      <CustomSyntaxHighlighter
        tabs={tabs}
        themeMode={isLightMode}
        indicatorColor="bg-blue-900"
      />
    );
  },
  SidebarProvider,
  SidebarLayout,
  MainContent,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeaderLogo,
  SidebarHeaderTitle,
  UserAvatar,
  NestedLink,
  Home,
  Users,
  Settings,
  FileText,
  BarChart,
  Mail,
  Bell,
  BookOpen,
  Component,
  Folder,
  FolderTree,
  File,
  Note,
  Menu,
  MenuItem,
  MenuTrigger,
  PopMenu,
  PopoverContent,
  PopoverTrigger,
  Popover,
  PopoverClose,
  NavMenu,
  NavMenuItem,
  NavMenuList,
  NavMenuTrigger,
  NavListItem,
  NavMenuContent,
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  DialogCloseTrigger,
  DialogContent,
  DialogTrigger,
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
};

interface Mdxchildren {
  code: string;
}

export function Mdx({ code }: Mdxchildren) {
  const Component = useMDXComponent(code, {
    style: 'default',
  });

  return (
    <div className="mdx">
      <Component components={components} />
    </div>
  );
}
