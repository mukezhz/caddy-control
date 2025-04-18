import React from 'react';

export function NavMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <nav className={`relative rounded-lg bg-background ${className}`}>
      {children}
    </nav>
  );
}

export function NavMenuList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <ul className={`flex gap-4 ${className}`}>{children}</ul>;
}

export function NavMenuItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={`relative rounded-lg group ${className}`}>{children}</li>
  );
}

export function NavMenuTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted ${className}`}
    >
      {children}
    </button>
  );
}

export function NavMenuContent({
  children,
  className,
  position = 'down',
}: {
  children: React.ReactNode;
  className?: string;
  position?: 'up' | 'down';
}) {
  return (
    <div
      className={`absolute left-0 rounded-lg ${position === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} w-64 border bg-background shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function NavMenuLink({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`block rounded-lg px-4 py-2 text-sm hover:bg-muted ${className}`}
    >
      {children}
    </a>
  );
}

export function NavListItem({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <NavMenuLink href={href}>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <p className="text-xs text-muted-foreground">{children}</p>
      </NavMenuLink>
    </li>
  );
}

export default function Preview() {
  return (
    <div className="flex gap-8 bg-background p-4">
      <NavMenu>
        <NavMenuList>
          <NavMenuItem>
            <NavMenuTrigger>Getting started</NavMenuTrigger>
            <NavMenuContent position="down">
              <ul className="grid gap-3 p-4 w-64">
                <NavListItem href="/docs" title="Introduction">
                  Overview of components and usage.
                </NavListItem>
                <NavListItem href="/docs/installation" title="Installation">
                  Learn how to install dependencies.
                </NavListItem>
              </ul>
            </NavMenuContent>
          </NavMenuItem>
        </NavMenuList>
      </NavMenu>

      <NavMenu>
        <NavMenuList>
          <NavMenuItem>
            <NavMenuTrigger>Components</NavMenuTrigger>
            <NavMenuContent position="down">
              <ul className="grid gap-3 p-4 w-64">
                <NavListItem href="/components/button" title="Button">
                  Usage of button component.
                </NavListItem>
                <NavListItem href="/components/card" title="Card">
                  Learn how to use cards effectively.
                </NavListItem>
              </ul>
            </NavMenuContent>
          </NavMenuItem>
        </NavMenuList>
      </NavMenu>

      <NavMenu>
        <NavMenuList>
          <NavMenuItem>
            <NavMenuTrigger>Resources</NavMenuTrigger>
            <NavMenuContent position="up">
              <ul className="grid gap-3 p-4 w-64">
                <NavListItem href="/resources/blogs" title="Blogs">
                  Read insightful blogs and tutorials.
                </NavListItem>
                <NavListItem href="/resources/community" title="Community">
                  Join discussions and share knowledge.
                </NavListItem>
              </ul>
            </NavMenuContent>
          </NavMenuItem>
        </NavMenuList>
      </NavMenu>
    </div>
  );
}
