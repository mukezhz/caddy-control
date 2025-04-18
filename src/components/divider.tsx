import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: string;
  length?: string;
  margin?: string;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  color = 'bg-gray-300',
  thickness = 'h-px',
  length = 'w-full',
  margin = 'my-4',
}) => {
  return orientation === 'horizontal' ? (
    <div className={`${color} ${thickness} ${length} ${margin}`} />
  ) : (
    <div
      className={`${color} ${thickness} ${length} ${margin}`}
      style={{ width: '1px' }}
    />
  );
};

export default Divider;
