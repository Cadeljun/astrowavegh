import { cn } from '@/lib/utils';

interface DividerProps {
  className?: string;
  variant?: 'dark' | 'light' | 'green';
}

export const Divider = ({ className, variant = 'dark' }: DividerProps) => {
  const variants = {
    dark: 'divider-dark',
    light: 'divider-light',
    green: 'divider-green'
  };
  
  return <div className={cn(variants[variant], className)} />;
};
