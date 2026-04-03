import type { ButtonHTMLAttributes, ReactNode } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({
  children,
  className = '',
  variant = 'primary',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={`button button--${variant} ${className}`.trim()}
      type={props.type ?? 'button'}
    >
      {children}
    </button>
  );
}
