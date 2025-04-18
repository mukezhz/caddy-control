'use client';

import type React from 'react';
import { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { FolderClosed, FolderOpen, LucideFileText } from 'lucide-react';

type FolderTreeContextType = {
  indentSize: number;
};

const FolderTreeContext = createContext<FolderTreeContextType>({
  indentSize: 16,
});

export function FolderTree({
  children,
  className,
  indentSize = 16,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  indentSize?: number;
}) {
  return (
    <FolderTreeContext.Provider value={{ indentSize }}>
      <div
        className={cn('text-sm border rounded-lg broder-b', className)}
        {...props}
      >
        {children}
      </div>
    </FolderTreeContext.Provider>
  );
}

export function Folder({
  children,
  element,
  defaultOpen = true,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  element: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { indentSize } = useContext(FolderTreeContext);

  return (
    <div className={cn('select-none', className)} {...props}>
      <FolderLabel
        name={element}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div
          className="pl-4 border-l border-border dark:border-border ml-2 mt-1"
          style={{ marginLeft: indentSize / 2 }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function File({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('select-none', className)} {...props}>
      <FileLabel>{children}</FileLabel>
    </div>
  );
}

function FolderLabel({
  name,
  isOpen,
  onClick,
}: {
  name: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="flex items-center gap-1 py-1 px-2 rounded-md hover:bg-muted/50 cursor-pointer"
      onClick={onClick}
    >
      <FolderIcon isOpen={isOpen} />
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}

function FileLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 py-1 px-2 rounded-md hover:bg-muted/50">
      <FileIcon />
      <span className="text-sm">{children}</span>
    </div>
  );
}

function FolderIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="w-4 h-4 flex items-center justify-center">
      {isOpen ? (
        // <svg
        //   xmlns="http://www.w3.org/2000/svg"
        //   width="16"
        //   height="16"
        //   viewBox="0 0 24 24"
        //   fill="none"
        //   stroke="currentColor"
        //   strokeWidth="2"
        //   strokeLinecap="round"
        //   strokeLinejoin="round"
        //   className="text-yellow-400 dark:text-yellow-300"
        // >
        //   <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        //   <path d="M2 10h20" />
        // </svg>
        <FolderOpen />
      ) : (
        // <svg
        //   xmlns="http://www.w3.org/2000/svg"
        //   width="16"
        //   height="16"
        //   viewBox="0 0 24 24"
        //   fill="none"
        //   stroke="currentColor"
        //   strokeWidth="2"
        //   strokeLinecap="round"
        //   strokeLinejoin="round"
        //   className="text-yellow-400 dark:text-yellow-300"
        // >
        //   <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        // </svg>
        <FolderClosed />
      )}
    </div>
  );
}

function FileIcon() {
  return (
    <div className="w-4 h-4 flex items-center justify-center">
      {/* <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-400 dark:text-blue-300"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg> */}
      <LucideFileText />
    </div>
  );
}
