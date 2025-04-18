import type React from 'react';
import { cn } from '@/lib/utils';
import {
  InfoIcon,
  AlertTriangleIcon,
  AlertCircle,
  CheckCircle2,
  BookmarkIcon,
} from 'lucide-react';

type NoteType = 'none' | 'info' | 'warning' | 'alert' | 'success' | 'tip';

interface NoteProps {
  children: React.ReactNode;
  type?: NoteType;
  className?: string;
  hideIcon?: boolean;
}

export function Note({
  children,
  type = 'none',
  className,
  hideIcon = false,
}: NoteProps) {
  // Define icons for each type
  const icons = {
    none: <BookmarkIcon className="h-5 w-5 text-muted-foreground" />,
    info: <InfoIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
    warning: (
      <AlertTriangleIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
    ),
    alert: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
    success: (
      <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
    ),
    tip: (
      <BookmarkIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
    ),
  };

  // Base styles for all notes
  const baseStyles =
    'mt-6 mb-3 rounded-xl border p-3 relative overflow-hidden shadow-sm';

  // Type-specific styles
  const typeStyles = {
    none: 'border-border bg-card text-card-foreground dark:bg-card/80',
    info: 'border-blue-100 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300',
    warning:
      'border-amber-100 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300',
    alert:
      'border-red-100 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
    success:
      'border-green-100 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300',
    tip: 'border-purple-100 bg-purple-50 text-purple-800 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-300',
  };

  // Gradient overlay styles
  const gradientStyles = {
    none: 'from-primary/5 to-transparent',
    info: 'from-blue-500/5 to-transparent',
    warning: 'from-amber-500/5 to-transparent',
    alert: 'from-red-500/5 to-transparent',
    success: 'from-green-500/5 to-transparent',
    tip: 'from-purple-500/5 to-transparent',
  };

  return (
    <div className={cn(baseStyles, typeStyles[type], className)}>
      {/* Subtle gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r pointer-events-none',
          gradientStyles[type]
        )}
      />

      <div className="relative z-10">
        {!hideIcon && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1">{children}</div>
          </div>
        )}

        {hideIcon && <div>{children}</div>}
      </div>
    </div>
  );
}
