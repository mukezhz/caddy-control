'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const inputVariants = cva(
  'flex w-full rounded-lg border transition-colors disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        outline: 'border-border bg-transparent focus-visible:ring-ring',
        filled: 'border-border bg-muted focus-visible:ring-ring',
        none: 'border-0 bg-transparent focus-visible:ring-transparent',
      },
      size: {
        xs: 'h-8 px-2 text-xs',
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
        xl: 'h-12 px-8 text-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      isError: {
        true: 'border-red-500 focus-visible:ring-red-500',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'sm',
      fullWidth: false,
      isError: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  isLoading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant, size, fullWidth, isError, isLoading, ...props },
    ref
  ) => {
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          className={cn(
            inputVariants({ variant, size, fullWidth, isError }),
            className
          )}
          {...props}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
