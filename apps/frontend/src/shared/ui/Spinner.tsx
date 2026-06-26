import { cn } from '@shared/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'h-[18px] w-[18px] border-2',
  md: 'h-8 w-8 border-[2.5px]',
  lg: 'h-9 w-9 border-[3px]',
} as const;

export const Spinner = ({ size = 'md', className }: SpinnerProps) => (
  <div
    className={cn(
      'animate-spin rounded-full border-b-2 border-primary',
      SIZE_CLASSES[size],
      className,
    )}
  />
);
