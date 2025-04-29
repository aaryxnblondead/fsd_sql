import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  type = 'button',
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  fullWidth = false,
}) => {
  const baseClasses = 'font-medium rounded-md focus:outline-none transition-colors';
  
  const variantClasses = {
    primary: 'bg-hr-blue hover:bg-blue-600 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    outline: 'bg-transparent border border-hr-blue text-hr-blue hover:bg-hr-blue hover:text-white',
    link: 'bg-transparent text-hr-blue hover:underline p-0',
  };
  
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-4 py-2',
    large: 'text-base px-6 py-3',
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'outline', 'link']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default Button; 