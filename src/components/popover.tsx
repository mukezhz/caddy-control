import { cn } from '@/lib/utils';
import React from 'react';
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from 'react';

export type Position = {
  xAlign: 'left' | 'center' | 'right';
  yAlign: 'top' | 'bottom' | 'center';
};

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';

type PopoverContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  close: () => void;
  position: PopoverPosition;
  actualPlacement: Position;
  setActualPlacement: React.Dispatch<React.SetStateAction<Position>>;
  isPositioned: boolean;  // Added isPositioned to the context
  setIsPositioned: React.Dispatch<React.SetStateAction<boolean>>;  // Added setIsPositioned to the context
};

const PopoverContext = createContext<PopoverContextType | null>(null);

type PopoverProps = {
  children: ReactNode;
  className?: string;
  open?: boolean;
  onClose?: () => void;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  position?: PopoverPosition;
};

export const Popover = ({
  children,
  className,
  open = false,
  onClose,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  position = 'bottom',
}: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [isPositioned, setIsPositioned] = useState(false);  // local state to track if the popover has been positioned
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [actualPlacement, setActualPlacement] = useState<Position>({
    xAlign: 'center',
    yAlign: position === 'top' ? 'top' : 'bottom',
  });

  // Controlled vs uncontrolled handling
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Handle external close function
  const close = () => {
    setIsOpen(false);
    setIsPositioned(false);  // Reset positioning state when closing
    onClose?.();
  };

  // Handle outside clicks
  useEffect(() => {
    if (!closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event?.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeOnOutsideClick, onClose]);

  // Handle ESC key
  useEffect(() => {
    if (!closeOnEsc) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, closeOnEsc, onClose]);

  return (
    <PopoverContext.Provider 
      value={{ 
        isOpen, 
        setIsOpen, 
        triggerRef, 
        close, 
        position, 
        actualPlacement,
        setActualPlacement: setActualPlacement,
        isPositioned, // pass isPositioned to context
        setIsPositioned, // pass setIsPositioned to context
      }}
    >
      <div className={`relative inline-block ${className || ''}`} ref={popoverRef}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

type PopoverTriggerProps = {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
};

export const PopoverTrigger = ({
  children,
  className,
  asChild = false,
}: PopoverTriggerProps) => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('PopoverTrigger must be used within a Popover');
  }
  const { setIsOpen, triggerRef } = context;

  // If asChild is true, we clone the child element to add our props
  if (
    asChild &&
    React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)
  ) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        setIsOpen((prev) => !prev);
        children.props.onClick?.(e as React.MouseEvent<HTMLElement>);
      },
      'aria-haspopup': 'true',
    });
  }

  return (
    <div
      className={`cursor-pointer ${className || ''}`}
      onClick={() => setIsOpen((prev) => !prev)}
      aria-haspopup="true"
      ref={triggerRef}
    >
      {children}
    </div>
  );
};

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
  position?: PopoverPosition;
  showArrow?: boolean;
  arrowClassName?: string;
  arrowSize?: number;
}

export const PopoverContent = ({
  children,
  className = '',
  sideOffset = 5,
  position = 'bottom',
  showArrow = true,
  arrowClassName = '',
  arrowSize = 8,
}: PopoverContentProps) => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('PopoverContent must be used within a Popover');
  }

  const { isOpen, triggerRef, isPositioned, setIsPositioned } = context;
  const [arrowDefaultClassName, setArrowDefaultClassName] =  useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<Position>({
    xAlign: 'center',
    yAlign: position === 'top' ? 'top' : 'bottom',
  });
  // const [isPositioned, setIsPositioned] = useState(false);
  const [dynamicStyles, setDynamicStyles] = useState({
    transform: 'translate(0px, 0px)',
  });
  const [arrowStyles, setArrowStyles] = useState<any>({});

  // Convert the preferred position to initial placements
  const getInitialPlacement = (pos: PopoverPosition): Position => {
    switch (pos) {
      case 'top':
        return { xAlign: 'center', yAlign: 'top' };
      case 'bottom':
        return { xAlign: 'center', yAlign: 'bottom' };
      case 'left':
        return { xAlign: 'left', yAlign: 'center' };
      case 'right':
        return { xAlign: 'right', yAlign: 'center' };
      default:
        return { xAlign: 'center', yAlign: 'bottom' };
    }
  };

  // This function handles positioning the content relative to the trigger
  const updatePosition = () => {
    if (!isOpen || !contentRef.current || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    // Viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available spaces
    const spaceAbove = triggerRect.top;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewportWidth - triggerRect.right;

    // Get preferred placements based on position prop
    const preferredPlacement = getInitialPlacement(position);

    // For vertical positioning (top or bottom)
    let yAlign: Position['yAlign'] = preferredPlacement.yAlign;
    let xAlign: Position['xAlign'] = preferredPlacement.xAlign;

    // Handle horizontal positions (left/right)
    if (position === 'left' || position === 'right') {
      // For left position, check if there's enough space
      if (position === 'left' && spaceLeft < contentRect.width) {
        // Not enough space on left, try right
        if (spaceRight >= contentRect.width) {
          xAlign = 'right';
        } else {
          // Not enough space on either side, use the one with more space
          xAlign = spaceLeft >= spaceRight ? 'left' : 'right';
        }
      }
      // For right position, check if there's enough space
      else if (position === 'right' && spaceRight < contentRect.width) {
        // Not enough space on right, try left
        if (spaceLeft >= contentRect.width) {
          xAlign = 'left';
        } else {
          // Not enough space on either side, use the one with more space
          xAlign = spaceRight >= spaceLeft ? 'right' : 'left';
        }
      }

      // For horizontal positions, center vertically by default
      yAlign = 'center';
    }
    // Handle vertical positions (top/bottom)
    else {
      // For bottom position, check if there's enough space
      if (position === 'bottom' && spaceBelow < contentRect.height) {
        // Not enough space below, try above
        if (spaceAbove >= contentRect.height) {
          yAlign = 'top';
        } else {
          // Not enough space on either side, use the one with more space
          yAlign = spaceBelow >= spaceAbove ? 'bottom' : 'top';
        }
      }
      // For top position, check if there's enough space
      else if (position === 'top' && spaceAbove < contentRect.height) {
        // Not enough space above, try below
        if (spaceBelow >= contentRect.height) {
          yAlign = 'bottom';
        } else {
          // Not enough space on either side, use the one with more space
          yAlign = spaceAbove >= spaceBelow ? 'top' : 'bottom';
        }
      }

      // Determine X alignment (left, center, right) for vertical positions
      const contentWidth = contentRect.width;
      const centerPos =
        triggerRect.left + triggerRect.width / 2 - contentWidth / 2;

      // Check if centered popover would go beyond screen edges
      if (centerPos < 0) {
        // Too far left, align with left side of trigger
        xAlign = 'left';
      } else if (centerPos + contentWidth > viewportWidth) {
        // Too far right, align with right side of trigger
        xAlign = 'right';
      } else {
        xAlign = 'center';
      }
    }

    // Set the final placement
    setPlacement({ xAlign, yAlign });

    // Calculate translation values
    let translateX = 0;
    let translateY = 0;

    // Calculate position based on placement
    if (yAlign === 'top') {
      translateY = -(contentRect.height + sideOffset);
    } else if (yAlign === 'bottom') {
      translateY = triggerRect.height + sideOffset;
    } else if (yAlign === 'center') {
      translateY = (triggerRect.height - contentRect.height) / 2;
    }

    if (xAlign === 'left') {
      if (position === 'left') {
        translateX = -(contentRect.width + sideOffset);
      } else {
        translateX = 0;
      }
    } else if (xAlign === 'right') {
      if (position === 'right') {
        translateX = triggerRect.width + sideOffset;
      } else {
        translateX = triggerRect.width - contentRect.width;
      }
    } else if (xAlign === 'center') {
      translateX = (triggerRect.width - contentRect.width) / 2;
    }

    // Position the arrow
    const arrowPosition = getArrowPosition(xAlign, yAlign, arrowSize);
    
    // Apply positioning with transform
    setDynamicStyles({
      transform: `translate(${translateX}px, ${translateY}px)`,
    });

    setArrowStyles(arrowPosition);
    // Now that we've calculated positions, make the popover visible
    setIsPositioned(true);
  };

  const getArrowPosition = (xAlign: string, yAlign: string, arrowSize: number) => {
    const arrowOffset = arrowSize / 2;
    const position: any = {};
    
    // Based on popover placement, determine arrow position and border styles
    if (yAlign === 'top') {
      position.bottom = `-${arrowOffset}px`;
      setArrowDefaultClassName(`border-r border-b border-border`);

    } else if (yAlign === 'bottom') {
      position.top = `-${arrowOffset}px`;
      setArrowDefaultClassName(`border-t border-l border-border`);
    }
    
    if ((yAlign === 'top' || yAlign === 'bottom') && xAlign === 'center') {
      position.left = '50%';
      position.marginLeft = `-${arrowOffset}px`;
    } else if ((yAlign === 'top' || yAlign === 'bottom') && xAlign === 'left') {
      position.left = '20px';
    } else if ((yAlign === 'top' || yAlign === 'bottom') && xAlign === 'right') {
      position.right = '20px';
    }
    
    if (xAlign === 'left' && yAlign === 'center') {
      position.right = `-${arrowOffset}px`;
      setArrowDefaultClassName(`border-r border-b border-border`);
      position.top = '50%';
      position.marginTop = `-${arrowOffset}px`;
    } else if (xAlign === 'right' && yAlign === 'center') {
      position.left = `-${arrowOffset}px`;
      setArrowDefaultClassName(`border-l border-b border-border`);
      position.top = '50%';
      position.marginTop = `-${arrowOffset}px`;
    }
    
    return position;
  };

  // Initialize position calculation in a layout effect to prevent flicker
  useEffect(() => {
    if (isOpen && contentRef.current && triggerRef.current) {
      updatePosition();
    }
    return undefined;
  }, [isOpen]);

  // Update position on scroll and resize
  useEffect(() => {
    // Skip if not positioned yet
    if (!isPositioned) return;
    
    const handlePositionChange = () => {
      window.requestAnimationFrame(updatePosition);
    };

    window.addEventListener('resize', handlePositionChange);
    window.addEventListener('scroll', handlePositionChange, true); // Capture phase to catch all scrolls

    return () => {
      window.removeEventListener('resize', handlePositionChange);
      window.removeEventListener('scroll', handlePositionChange, true);
    };
  }, [isOpen, sideOffset, position, isPositioned]);

  // Update position when content changes
  useEffect(() => {
    if (!isPositioned) return;
    
    const observer = new MutationObserver(updatePosition);
    if (contentRef.current) {
      observer.observe(contentRef.current, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, [isOpen, isPositioned]);

  if (!isOpen) {
    return null;
  }

  return (<div
      ref={contentRef}
      className={`absolute z-50 border rounded-lg shadow-sm bg-background border-border max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)] transition-opacity duration-200 ${isPositioned ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{
        top: 0,
        left: 0,
        ...dynamicStyles,
      }}
      role="dialog"
      data-placement={`${placement.yAlign}-${placement.xAlign}`}
    >
      {children}
      {showArrow && (
        <div 
          className={cn(`absolute bg-background rotate-45 z-40`,arrowDefaultClassName, arrowClassName)}
          style={{
            width: `${arrowSize}px`,
            height: `${arrowSize}px`,
            ...arrowStyles
          }}
          data-popover-arrow
        />
      )}
    </div>);
};

// Additional components for convenience
type PopoverCloseProps = {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
};

export const PopoverClose = ({
  children,
  className,
  asChild = false,
}: PopoverCloseProps) => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('PopoverClose must be used within a Popover');
  }
  const { close } = context;

  // If asChild is true, we clone the child element to add our props
  if (
    asChild &&
    React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)
  ) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        close();
        children.props.onClick?.(e as React.MouseEvent<HTMLElement>);
      },
    });
  }

  return (
    <div
      className={`cursor-pointer ${className || ''}`}
      onClick={close}
      aria-label="Close"
    >
      {children}
    </div>
  );
};