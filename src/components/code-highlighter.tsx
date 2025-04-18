'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabProps {
  name?: string;
  children: React.ReactNode;
}

// Tab component – developers can optionally provide a name prop.
// If no name is provided, the language from the code block (or a default) is used.
export const CodeTab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

interface TabInfo {
  syntax: string;
  language?: string;
  name: string;
}

interface CodeHighlighterProps {
  children: React.ReactNode;
  className?: string;
  // Choose theme mode (default: "dark")
  themeMode?: 'light' | 'dark';
  // Provide custom themes (optional)
  lightTheme?: Record<string, any>;
  darkTheme?: Record<string, any>;
  // Customize the animated indicator color
  indicatorColor?: string; // Accepts hex or Tailwind class
}

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  children,
  className,
  themeMode = 'dark',
  lightTheme = oneLight,
  darkTheme = oneDark,
  indicatorColor,
}) => {
  // Filter out and validate Tab children
  const tabElements = React.Children.toArray(children).filter(
    (child) =>
      React.isValidElement(child) &&
      (child.type === CodeTab ||
        (typeof child.type === 'function' && child.type.name === 'Tab'))
  );

  if (tabElements.length === 0) {
    throw new Error(
      'Error: You must provide at least one <Tab> child. Example:\n\n' +
        `<CodeHighlighter themeMode="dark" indicatorColor="bg-blue-900">\n  <Tab name="jsx">{\`\\\`\\\`jsx\nconst a = 1\n\\\`\\\`\\\`\`}</Tab>\n</CodeHighlighter>`
    );
  }

  // Parse each Tab child for its code block content.
  // We assume a code block format:
  // \`\`\`<language>\n<code>\n\`\`\`
  const tabs: Record<string, TabInfo> = {};
  tabElements.forEach((child, index) => {
    const { name, children: tabContent } = (
      child as React.ReactElement<TabProps>
    ).props;
    const content = typeof tabContent === 'string' ? tabContent.trim() : '';
    const codeRegex = /^```(\w+)\n([\s\S]+?)\n```$/;
    const match = content.match(codeRegex);
    let language = '';
    let syntax = '';
    if (match) {
      language = match[1];
      syntax = match[2];
    } else {
      syntax = content;
    }
    // Use provided name if exists; otherwise, fall back to language or default label.
    const tabName = name ? name : language || `Tab ${index + 1}`;
    tabs[tabName] = { syntax, language, name: tabName };
  });

  const tabKeys = Object.keys(tabs);
  const [activeTabKey, setActiveTabKey] = useState<string>(tabKeys[0]);
  const [copied, setCopied] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const activeTab = tabRefs.current[activeTabKey];
    if (activeTab) {
      const tabWidth = activeTab.offsetWidth;
      const indicatorWidth = 55;
      const leftOffset = activeTab.offsetLeft + (tabWidth - indicatorWidth) / 2;
      setIndicatorStyle({
        left: `${leftOffset}px`,
        width: `${indicatorWidth}px`,
      });
    }
  }, [activeTabKey, tabs]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tabs[activeTabKey].syntax);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Determine the indicator color based on whether it is a hex value or a Tailwind class.
  const isHexColor = indicatorColor?.startsWith('#');
  const indicatorClass = isHexColor ? '' : indicatorColor || 'bg-yellow-500';
  const combinedIndicatorStyle = {
    ...indicatorStyle,
    ...(isHexColor && indicatorColor
      ? { backgroundColor: indicatorColor }
      : {}),
  };

  return (
    <div className={cn('', className)}>
      {/* Tab Container */}
      <div
        className={cn(
          'p-2 rounded-t-lg',
          themeMode === 'light'
            ? 'bg-gray-100 text-black'
            : 'bg-[#1c1c1c] text-white'
        )}
      >
        <div className="flex items-center h-6">
          {/* Window controls */}
          <div className="flex space-x-2 items-center mr-6">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"></div>
          </div>

          {/* Tab headers */}
          <div className="flex items-center relative">
            {tabKeys.map((key) => (
              <div
                key={key}
                ref={(el) => {
                  tabRefs.current[key] = el;
                }}
                onClick={() => setActiveTabKey(key)}
                className={cn(
                  'group relative flex items-center h-7 px-3 text-xs select-none cursor-pointer transition-all duration-200 mx-0.5 max-w-[200px] min-w-[60px]',
                  key === activeTabKey
                    ? themeMode === 'light'
                      ? 'text-black bg-white'
                      : 'text-white bg-[#2a2a2a]'
                    : themeMode === 'light'
                      ? 'text-gray-600 hover:bg-gray-200'
                      : 'text-gray-400 hover:bg-[#252525]'
                )}
              >
                {key}
              </div>
            ))}
            {/* Animated indicator */}
            <div
              className={`absolute bottom-0 h-[2px] transition-all duration-300 ease-in-out ${indicatorClass}`}
              style={combinedIndicatorStyle}
            />
          </div>

          {/* Copy Button */}
          <Button
            variant={'none'}
            onClick={copyToClipboard}
            className={cn(
              'w-8 h-8 relative focus:ring-0 focus:outline-none ml-auto',
              themeMode === 'light'
                ? 'bg-gray-300 hover:bg-gray-400'
                : 'bg-[#1F2937] hover:bg-[#374151]'
            )}
          >
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
                copied ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
              }`}
            >
              <Copy className="h-4 w-4" />
            </span>
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
                copied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}
            >
              <Check className="h-4 w-4" />
            </span>
            <span className="sr-only">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      </div>

      {/* Syntax Highlighter */}
      <div className="transition-all duration-500 ease-in-out">
        <SyntaxHighlighter
          language={tabs[activeTabKey].language?.toLowerCase() || 'shell'}
          style={themeMode === 'light' ? lightTheme : darkTheme}
          customStyle={{
            fontSize: '15px',
            margin: 0,
            borderRadius: '0 0 0.5rem 0.5rem',
          }}
        >
          {tabs[activeTabKey].syntax}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
