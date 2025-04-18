'use client';

import * as React from 'react';
import clsx from 'clsx';
import { Command, Search } from 'lucide-react';
import { Button } from '@/components/button';
import { cn } from '@/lib/utils';

export interface SearchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMapping = {
  xs: {
    button: 'py-1 px-2 text-xs',
    icon: 'px-1',
    iconSize: 11,
  },
  sm: {
    button: 'py-1.5 px-3 text-sm',
    icon: 'px-1',
    iconSize: 11,
  },
  md: {
    button: 'py-2 px-4 text-base',
    icon: 'px-1',
    iconSize: 13,
  },
  lg: {
    button: 'py-3 px-6 text-lg',
    icon: 'px-2',
    iconSize: 14,
  },
  xl: {
    button: 'py-4 px-8 text-xl',
    icon: 'px-2',
    iconSize: 15,
  },
};

const SearchButton = React.forwardRef<HTMLButtonElement, SearchButtonProps>(
  (
    {
      placeholder = 'Search Documentation..',
      size = 'sm',
      className,
      ...props
    },
    ref
  ) => {
    const { icon, iconSize } = sizeMapping[size];
    return (
      <Button
        ref={ref}
        variant={'outline'}
        className={cn('flex flex-1 space-x-2 bg-muted hover:brightness-100 dark:hover:brightness-[1.28]', className)}
        {...props}
      >
        <Search size={16}/>
        <span>{placeholder}</span>
        <span
          className={clsx(
            'inline-flex items-center justify-center rounded border border-border gap-1',
            'bg-muted',
            icon
          )}
        >
          <Command size={iconSize} />
          <span>k</span>
        </span>
      </Button>
    );
  }
);

SearchButton.displayName = 'SearchButton';

export default SearchButton;
