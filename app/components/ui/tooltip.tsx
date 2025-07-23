import * as React from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  shortcut?: string;
}

export function Tooltip({ children, content, shortcut }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-800 rounded shadow-lg whitespace-nowrap z-50">
          {content}
          {shortcut && (
            <span className="ml-2 text-gray-300">
              {shortcut}
            </span>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}
