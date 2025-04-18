'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // <-- Change this to use `cn`

export const buttonVariants = cva(
  'cursor-pointer flex items-center rounded-lg border font-medium transition-colors',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary-foreground',
        outline: 'border border-border hover:bg-muted/20 focus:ring-ring',
        none: 'bg-transparent border-0 hover:bg-gray-100 dark:hover:bg-gray-800',
      },
      size: {
        xs: 'h-8 py-1 px-2 text-xs',
        sm: 'h-9 py-1.5 px-3 text-sm',
        md: 'h-11 py-2 px-4 text-md',
        lg: 'h-12 py-3 px-6 text-lg',
        xl: 'h-14 py-4 px-8 text-xl',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'sm',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * A fully customizable Button component.
 *
 * This component uses Tailwind CSS classes with your global CSS variables,
 * so it will automatically adjust for dark and light mode. It also supports
 * size variants (xs, sm, md, lg, xl) and variant styles (primary, secondary, outline).
 *
 * @example
 * <Button variant="secondary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)} // <-- Updated here
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
