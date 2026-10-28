import React from 'react';
import { cn } from '../../utils/cn';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  hoverable?: boolean;
  children?: React.ReactNode;
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'md',
      hoverable,
      onClick,
      onKeyDown,
      className,
      children,
      role,
      tabIndex,
      ...props
    },
    ref
  ) => {
    const isInteractive = Boolean(onClick);
    const shouldHover = hoverable ?? isInteractive;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
      onKeyDown?.(e);
    };

    return (
      <div
        ref={ref}
        role={isInteractive && !role ? 'button' : role}
        tabIndex={isInteractive && tabIndex === undefined ? 0 : tabIndex}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'bg-white rounded-2xl shadow-sm border border-slate-200/80 text-slate-800 transition-all duration-200 font-sans',
          paddingStyles[padding],
          shouldHover && 'hover:shadow-md hover:border-slate-300',
          isInteractive && 'cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-base sm:text-lg font-bold text-slate-900 tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs sm:text-sm text-slate-500', className)}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4 border-t border-slate-100', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';
