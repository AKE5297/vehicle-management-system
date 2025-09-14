import { cn } from "@/lib/utils";
import React from "react";

// Button variants and sizes
type ButtonVariant = "primary" | "secondary" | "view" | "edit" | "delete" | "text";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  fullWidth?: boolean;
}

// Button component with standardized styles
const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  className,
  ...props
}) => {
  // Base button styles
  const baseStyles = cn(
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed",
    fullWidth ? "w-full" : "inline-flex",
    {
      "focus:ring-blue-500 dark:focus:ring-blue-400": variant === "primary",
      "focus:ring-gray-500 dark:focus:ring-gray-400": variant === "secondary",
      "focus:ring-green-500 dark:focus:ring-green-400": variant === "view",
      "focus:ring-blue-600 dark:focus:ring-blue-500": variant === "edit",
      "focus:ring-red-500 dark:focus:ring-red-400": variant === "delete",
      "focus:ring-transparent": variant === "text",
    },
    className
  );

  // Size-specific styles
  const sizeStyles = cn({
    "px-3 py-1.5 text-sm": size === "sm",
    "px-4 py-2 text-base": size === "md",
    "px-6 py-2.5 text-lg": size === "lg",
  });

  // Variant-specific styles
  const variantStyles = cn({
    // Primary button
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg":
      variant === "primary",
    
    // Secondary button
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700":
      variant === "secondary",
    
    // View button
    "bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30":
      variant === "view",
    
    // Edit button
    "bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30":
      variant === "edit",
    
    // Delete button
    "bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30":
      variant === "delete",
    
    // Text button
    "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700":
      variant === "text",
  });

  // Icon styles
  const iconStyles = "mr-2";

  return (
    <button
      className={cn(baseStyles, sizeStyles, variantStyles)}
      {...props}
    >
      {icon && <i className={`fa-solid ${icon} ${iconStyles}`}></i>}
      {children}
    </button>
  );
};

export default Button;