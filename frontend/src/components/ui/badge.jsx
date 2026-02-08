import React from 'react';

const variantClasses = {
  default: 'badge-default',
  secondary: 'badge-secondary',
  outline: 'badge-outline',
  success: 'badge-success',
};

export function Badge({ children, className = '', variant = 'default', ...props }) {
  const classes = [
    'badge',
    variantClasses[variant] || variantClasses.default,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

export default Badge;
