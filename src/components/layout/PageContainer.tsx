import React from 'react';

export interface PageContainerProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: '5xl' | '6xl' | '7xl' | 'full';
}

const maxWidthMap = {
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  'full': 'max-w-full',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  maxWidth = '7xl',
}) => {
  return (
    <div className={`w-full ${maxWidthMap[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            {title && (
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex items-center space-x-3 shrink-0">
              {action}
            </div>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
