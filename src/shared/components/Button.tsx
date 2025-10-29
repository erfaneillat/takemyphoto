import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  iconOnly = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 inline-flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'bg-primary dark:bg-white text-white dark:text-black hover:bg-primary-dark dark:hover:bg-gray-200 focus:ring-primary dark:focus:ring-white',
    secondary: 'bg-background-secondary dark:bg-gray-800 text-foreground dark:text-white hover:bg-background-secondary/80 dark:hover:bg-gray-700 focus:ring-primary dark:focus:ring-white',
    outline: 'border-2 border-primary dark:border-white text-primary dark:text-white hover:bg-primary/10 dark:hover:bg-white/10 focus:ring-primary dark:focus:ring-white',
  };

  const sizeStyles = {
    sm: iconOnly ? 'p-1.5 text-sm' : 'px-3 py-1.5 text-sm',
    md: iconOnly ? 'p-2 text-base' : 'px-4 py-2 text-base',
    lg: iconOnly ? 'p-3 text-lg' : 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="inline-flex items-center">{leftIcon}</span>}
      {!iconOnly && children}
      {rightIcon && <span className="inline-flex items-center">{rightIcon}</span>}
    </button>
  );
};
