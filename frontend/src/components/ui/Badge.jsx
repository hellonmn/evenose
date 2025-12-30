import clsx from 'clsx';

const variants = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'bg-blue-100 text-blue-800',
};

export default function Badge({ children, variant = 'primary', className }) {
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
