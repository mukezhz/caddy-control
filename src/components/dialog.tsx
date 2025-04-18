'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

type DialogContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

type DialogProps = {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export function Dialog({ children, open: controlledOpen, setOpen: controlledSetOpen }: DialogProps) {
  const isControlled = controlledOpen !== undefined && controlledSetOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? controlledSetOpen : setUncontrolledOpen;

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, className }: { children: React.ReactNode, className?: string; }) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('DialogTrigger must be inside Dialog');

  const { setOpen } = ctx;

  return (
    <div onClick={() => setOpen(true)} className={cn("cursor-pointer", className)}>
      {children}
    </div>
  );
}

export function DialogContent({
  children,
  className = '',
  overlayClassName = '',
  closeOnClickOutside = true,
}: {
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnClickOutside?: boolean;
}) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('DialogContent must be inside Dialog');

  const { open, setOpen } = ctx;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // prevent background scroll
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        `fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-300`,
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        overlayClassName
      )}
      onClick={(e) => {
        if (closeOnClickOutside && e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div
        className={cn(
          `relatives bg-background text-foreground border border-border rounded-xl shadow-lg w-full max-w-[90vw] p-6 max-h-[90vh] transition-all duration-300 transform`,
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogClose({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('DialogClose must be inside Dialog');

  const { setOpen } = ctx;

  return (
    <div
      onClick={() => setOpen(false)}
      className={cn('cursor-pointer absolute top-4 right-4', className)}
    >
      {children ?? (
        <span className="text-lg font-bold">×</span>
      )}
    </div>
  );
}

// Dialog close component
type DialogCloseTriggerProps = {
  children?: React.ReactNode;
  className?: string;
  asChild?: boolean;
};

export function DialogCloseTrigger({
  children,
  className = '',
  asChild = false,
}: DialogCloseTriggerProps) {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('DialogCloseTrigger must be used within a Dialog');
  }

  const { setOpen } = context;

  const handleClick = () => {
    setOpen(false);
  };

  if (!children) {
    return (
      <div
        className={`cursor-pointer absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
        onClick={handleClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span className="sr-only">Close</span>
      </div>
    );
  }

  if (asChild) {
    return (
      <div onClick={handleClick} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div onClick={handleClick} className={`cursor-pointer ${className}`}>
      {children}
    </div>
  );
}

// Dialog header component
type DialogHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

// Dialog title component
type DialogTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return (
    <h2
      className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`}
    >
      {children}
    </h2>
  );
}

// Dialog description component
type DialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogDescription({
  children,
  className = '',
}: DialogDescriptionProps) {
  return (
    <p className={`mt-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

// Dialog footer component
type DialogFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div className={`mt-6 flex justify-end gap-3 ${className}`}>{children}</div>
  );
}
