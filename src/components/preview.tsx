'use client';
import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

interface PreviewProps {
  children: ReactNode;
  className?: string;
}

export function Preview({ children, className }: PreviewProps) {
  return (
    <div
      className={cn(
        `p-4 h-[330px] justify-items-center content-center rounded-lg border border-border bg-muted text-card-foreground`,
        className
      )}
    >
      {children}
    </div>
  );
}

export default Preview;
