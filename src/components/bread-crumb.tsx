import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  path: string;
  separator?: React.ReactNode;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  path,
  separator = <ChevronRight />,
}) => {
  // Remove the leading slash if it exists, then split the path
  const breadcrumbArray = path.startsWith('/')
    ? path.slice(1).split('/')
    : path.split('/');

  return (
    <div className="flex items-center text-sm">
      {breadcrumbArray.map(
        (item: string, index: React.Key | null | undefined) => {
          const isLastItem = index === breadcrumbArray.length - 1;

          return (
            <div key={index} className="flex items-center">
              {/* Display the breadcrumb */}
              <span
                className={`${
                  isLastItem
                    ? 'text-gray-600 dark:text-gray-300 font-bold' // Last item color (light and dark)
                    : 'text-gray-600 dark:text-gray-300' // Other items color (light and dark)
                } capitalize`} // Optionally capitalize the breadcrumb text
              >
                {item.replace(/-/g, ' ')} {/* Optionally format the item */}
              </span>
              {/* Add separator if it's not the last item */}
              {!isLastItem && (
                <span className="text-gray-400 dark:text-gray-500 mx-2">
                  {separator}
                </span>
              )}
            </div>
          );
        }
      )}
    </div>
  );
};

export default Breadcrumb;
