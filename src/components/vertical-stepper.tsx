'use client';

import type React from 'react';
import { cn } from '@/lib/utils';

export interface StepProps {
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface StepperProps {
  steps: StepProps[];
  mode?: 'vertical' | 'horizontal';
  className?: string;
  stepClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  lineClassName?: string;
  numberClassName?: string;
}

export default function Stepper({
  steps,
  mode = 'vertical',
  className,
  stepClassName,
  titleClassName,
  contentClassName,
  lineClassName,
  numberClassName,
}: StepperProps) {
  const isHorizontal = mode === 'horizontal';

  return (
    <div
      className={cn(
        'w-full',
        isHorizontal
          ? 'md:flex md:flex-row md:items-start md:justify-between'
          : 'flex flex-col',
        className
      )}
    >
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            'relative',
            isHorizontal ? 'md:flex-1 md:px-2 w-full md:w-auto' : 'pl-10 pb-8',
            index === steps.length - 1 ? 'pb-0' : '',
            stepClassName
          )}
        >
          {/* Step number */}
          <div
            className={cn(
              'absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-medium',
              isHorizontal ? 'md:relative md:mx-auto md:mb-4' : '',
              numberClassName
            )}
          >
            {index + 1}
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'absolute bg-gray-200 dark:bg-gray-700',
                isHorizontal
                  ? 'hidden md:block md:h-0.5 md:w-full md:top-4 md:left-1/2'
                  : 'left-4 top-8 h-full w-0.5',
                lineClassName
              )}
            />
          )}

          {/* Content */}
          <div
            className={cn(
              'flex flex-col',
              isHorizontal ? 'md:text-center' : ''
            )}
          >
            <div
              className={cn(
                'font-medium text-gray-900 dark:text-gray-100 mb-2',
                titleClassName
              )}
            >
              {step.title}
            </div>
            <div
              className={cn(
                'text-gray-600 dark:text-gray-300',
                contentClassName
              )}
            >
              {step.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
