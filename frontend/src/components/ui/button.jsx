import React from 'react';
import './ui.css';

const variantClasses = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  institutional: 'btn-institutional',
  hero: 'btn-hero',
  'hero-outline': 'btn-hero-outline',
  secondary: 'btn-secondary',
};

const sizeClasses = {
  sm: 'btn-sm',
  default: '',
  lg: 'btn-lg',
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'default',
  asChild = false,
  ...props
}) {
  const classes = [
    'btn',
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      className: [children.props.className, classes].filter(Boolean).join(' '),
    });
  }

  const Tag = props.href ? 'a' : 'button';
  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}

export default Button;
