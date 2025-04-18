'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TocData } from '../../config/toc';
import { AlignLeft } from 'lucide-react';

interface TocProps {
  doc: {
    title: string;
    slug: string;
  };
}

const Toc: React.FC<TocProps> = ({ doc }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(`${pathname}${window.location.hash}`);
    };

    updatePath(); // Set initial value
    window.addEventListener('hashchange', updatePath);

    return () => {
      window.removeEventListener('hashchange', updatePath);
    };
  }, [pathname, searchParams]); // Reacts to URL changes

  return (
    <aside className="fixed right-0 hidden xl:block w-64 p-6 top-16 border-l border-[var(--color-border)] h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="top-0 pb-2">
        <h2 className="flex flex-1 gap-2 item-center font-semibold text-[var(--color)]"><AlignLeft size={19} />On this page</h2>
      </div>
      <nav className="mt-4">
        <ul className="space-y-3">
          {TocData[doc.slug as keyof typeof TocData]?.map((item, index) => {
            const isActive = currentPath === item.href;

            return (
              <li key={index} className="group">
                <Link
                  href={item.href}
                  className={`transition-colors flex items-center ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-gray-700 dark:text-gray-200 font-normal'
                  }`}
                >
                  {item.title}
                </Link>

                {'pages' in item && (item.pages ?? []).length > 0 && (
                  <ul className="mt-2 ml-4 space-y-2 border-l-2 border-gray-300 pl-3">
                    {item.pages?.map((subItem, subIndex) => {
                      const isSubActive = currentPath === subItem.href;

                      return (
                        <li key={subIndex} className="text-sm">
                          <Link
                            href={subItem.href}
                            className={`transition-colors block py-1 ${
                              isSubActive
                                ? 'text-primary font-bold'
                                : 'text-gray-600 dark:text-gray-200 font-regular'
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Toc;
