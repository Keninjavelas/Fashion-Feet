import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import Link, { LinkProps } from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

export type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: 'button';
};

export type ButtonLinkProps = BaseProps & LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  as: 'link';
};

export type Props = ButtonProps | ButtonLinkProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-brand-900)] text-white hover:bg-[var(--color-accent-gold)] border border-transparent shadow-sm',
  secondary: 'bg-transparent text-[var(--color-brand-900)] hover:bg-black/5 border border-[var(--color-brand-900)]',
  tertiary: 'bg-transparent text-foreground/80 hover:text-[var(--color-brand-900)] underline-offset-4 hover:underline px-0 py-0',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>((props, ref) => {
  const { variant = 'primary', size = 'md', className = '', children, as = 'button', ...rest } = props;

  const baseStyles = 'inline-flex items-center justify-center font-medium uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${variant !== 'tertiary' ? sizeStyles[size] : ''} ${className}`;

  if (as === 'link') {
    const { href, ...linkProps } = rest as ButtonLinkProps;
    return (
      <Link href={href} className={combinedClassName} ref={ref as React.ForwardedRef<HTMLAnchorElement>} {...(linkProps as any)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} ref={ref as React.ForwardedRef<HTMLButtonElement>} {...(rest as ButtonProps)}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';
