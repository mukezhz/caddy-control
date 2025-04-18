// src/app/doc/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { allDocs } from 'contentlayer2/generated';
import SearchDialog from '@/components/search-dialog';
import { sidebarNav } from '../../../config/sidebar';
import Image from 'next/image';
import {
  SidebarProvider,
  SidebarLayout,
  MainContent,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeaderLogo,
  UserAvatar,
  NestedLink,
  SidebarHeaderTitle,
} from '@/components/sidebar';
import { Github } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/header';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/button';
import { useIsMobile } from '../../../hooks/use-mobile';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Destructure sidebarNav from configDocs
  const router = useRouter();
  const isMobile = useIsMobile();
  return (
    <SidebarLayout>
      {/* Left Sidebar Provider */}
      <SidebarProvider
        defaultOpen={isMobile ? false : true}
        defaultSide="left"
        defaultMaxWidth={280}
        showIconsOnCollapse={true}
      >
        <Sidebar>
          <SidebarHeader>
            <SidebarHeaderLogo
              logo={
                <Image
                  alt="logo"
                  className={'h-auto w-aut dark:invert'}
                  width={100}
                  height={100}
                  src={`/logo.png`}
                />
              }
            />

            <Link href={'/docs'} className="flex flex-1 gap-3">
              <SidebarHeaderTitle className='text-lg'>
                Caddy Control
              </SidebarHeaderTitle>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            {sidebarNav.map((section) => (
              <SidebarMenuItem
                isCollapsable={section.pages && section.pages.length > 0}
                key={section.title}
                label={section.title}
                icon={section.icon}
                defaultOpen={section.defaultOpen}
              >
                {section.pages?.map((page) => (
                  <NestedLink key={page.href} href={page.href}>
                    {page.title}
                  </NestedLink>
                ))}
              </SidebarMenuItem>
            ))}
          </SidebarContent>

          <SidebarFooter>
            <UserAvatar
              avatar={
                <Image
                  alt="logo"
                  src={'https://avatars.githubusercontent.com/u/43813670?v=4'}
                  width={100}
                  height={100}
                />
              }
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Mukesh Kumar Chaudhary
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                mukezhz@gmail.com
              </span>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <MainContent>
          <Header className="justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold">Documentation</h1>
            </div>
            <div className="flex gap-2 items-center pr-0 lg:pr-8">
              <SearchDialog searchData={allDocs} />
              <ModeToggle />
              <Button
                onClick={() =>
                  router.push('https://github.com/mukezhz/caddy-control')
                }
              >
                <Github className="h-[1.2rem] w-[1.2rem] transition-all" />
              </Button>
            </div>
          </Header>
          <main className="overflow-auto p-6">{children}</main>
        </MainContent>
      </SidebarProvider>

      {/* Right Sidebar Provider */}
      {/* <SidebarProvider defaultOpen={false} defaultSide="right" defaultMaxWidth={300} showIconsOnCollapse={true}>
        <Sidebar>
          <SidebarHeader>
            <SidebarTrigger />
            <Title>Documentation</Title>
            <BookOpen className="h-5 w-5" />
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem icon={<BookOpen className="h-5 w-5" />} label="Getting Started" href="/docs/getting-started" />
              <SidebarMenuItem icon={<Settings className="h-5 w-5" />} label="Configuration" href="/docs/configuration" />
              <SidebarMenuItem icon={<FileText className="h-5 w-5" />} label="API Reference" defaultOpen={true}>
                <NestedLink href="/docs/api/overview">Overview</NestedLink>
                <NestedLink href="/docs/api/endpoints">Endpoints</NestedLink>
                <NestedLink href="/docs/api/authentication">Authentication</NestedLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <div className="text-sm text-gray-500">v1.0.0</div>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider> */}
    </SidebarLayout>
  );
}
