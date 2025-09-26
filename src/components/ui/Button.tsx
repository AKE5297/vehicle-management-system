import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps {
  variant?: 'default' | 'view' | 'edit' | 'delete' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  children,
  icon,
  onClick,
  disabled = false,
  className = '',
  type = 'button'
}) => {
  // 基础样式
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // 变体样式
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    view: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700',
    edit: 'border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 dark:focus:ring-blue-700',
    delete: 'border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500 dark:border-red-600 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-800/30 dark:focus:ring-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  // 尺寸样式
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  // 禁用样式
  const disabledStyles = 'opacity-50 cursor-not-allowed';
  
  // 组合样式
  const buttonClassName = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabled && disabledStyles,
    className
  );
  
  return (
    <button
      type={type}
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <i className={`fa-solid ${icon} mr-2`}></i>}
      {children}
    </button>
  );
};