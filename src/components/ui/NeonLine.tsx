import { cn } from '@/lib/utils';

interface NeonLineProps {
  orientation?: 'horizontal' | 'vertical';
  color?: 'gold' | 'purple' | 'cyan';
  length?: string;
  className?: string;
}

const NeonLine = ({ orientation = 'horizontal', color = 'gold', length = '100px', className }: NeonLineProps) => {
  const colors = {
    gold: 'bg-[var(--color-gold)] shadow-[0_0_15px_var(--color-gold)]',
    purple: 'bg-[var(--color-purple)] shadow-[0_0_15px_var(--color-purple)]',
    cyan: 'bg-[var(--color-cyan)] shadow-[0_0_15px_var(--color-cyan)]',
  };

  return (
    <div
      className={cn(colors[color], className)}
      style={{
        width: orientation === 'horizontal' ? length : '1px',
        height: orientation === 'vertical' ? length : '1px',
      }}
    />
  );
};

export { NeonLine };
