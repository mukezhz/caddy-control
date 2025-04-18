import React from 'react';
import clsx from 'clsx';

const Header: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <header
      className={clsx(
        'sticky top-0 z-1 flex items-center justify-between xs:min-h-auto md:min-h-16 border-b px-3 bg-defaultBase/60 backdrop-blur',
        className
      )}
      {...props}
    >
      {/* <div className="container mx-auto px-4 py-2 flex justify-between items-center"> */}
      {children}
      {/* </div> */}
    </header>
  );
};

export default Header;
