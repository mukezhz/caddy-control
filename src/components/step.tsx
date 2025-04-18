'use client';

import React from 'react';
import clsx from 'clsx';

export interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  const stepsArray = React.Children.toArray(children).filter((child) =>
    React.isValidElement(child)
  );
  return (
    <div className={clsx('relative', className)}>
      {stepsArray.map((child, index) =>
        React.cloneElement(child as React.ReactElement<any>, {
          stepNumber: index + 1,
          isLast: index === stepsArray.length - 1,
        })
      )}
    </div>
  );
}

export interface StepProps {
  children: React.ReactNode;
  stepNumber?: number;
  isLast?: boolean;
  contentPosition?: 'right' | 'below';
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  lineClassName?: string;
  numberClassName?: string;
}

export function Step({
  children,
  stepNumber,
  isLast,
  contentPosition = 'below',
  className,
  titleClassName,
  contentClassName,
  lineClassName,
  numberClassName,
}: StepProps) {
  // Extract Title and Content children
  const childrenArray = React.Children.toArray(
    children
  ) as React.ReactElement[];
  const titleChild = childrenArray.find((child) => child.type === StepTitle);
  const contentChild = childrenArray.find(
    (child) => child.type === StepContent
  );

  const isHorizontal = contentPosition === 'right';

  return (
    <div
      className={clsx(
        'relative pl-10',
        className,
        isHorizontal ? 'flex items-center gap-4' : 'flex flex-col'
      )}
    >
      {/* Step number circle */}
      <div
        className={clsx(
          'absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-medium',
          numberClassName
        )}
      >
        {stepNumber}
      </div>
      {/* Connector line */}
      {!isLast && (
        <div
          className={clsx(
            'absolute left-4 top-8 h-full w-0.5 bg-gray-300 dark:bg-gray-600',
            lineClassName
          )}
        />
      )}
      {isHorizontal ? (
        // Horizontal layout: Title on the left, content on the right.
        <>
          <div
            className={clsx(
              'font-medium text-gray-900 dark:text-gray-100',
              titleClassName
            )}
          >
            {titleChild}
          </div>
          <div
            className={clsx(
              'text-gray-600 dark:text-gray-300',
              contentClassName
            )}
          >
            {contentChild}
          </div>
        </>
      ) : (
        // Vertical layout: Title on top, content below.
        <>
          <div
            className={clsx(
              'font-medium text-gray-900 dark:text-gray-100 mb-2',
              titleClassName
            )}
          >
            {titleChild}
          </div>
          <div
            className={clsx(
              'text-gray-600 dark:text-gray-300',
              contentClassName
            )}
          >
            {contentChild}
          </div>
        </>
      )}
    </div>
  );
}

// Title component for a Step.
export function StepTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx('step-title', className)}>{children}</div>;
}

// Content component for a Step.
export function StepContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx('step-content', className)}>{children}</div>;
}
