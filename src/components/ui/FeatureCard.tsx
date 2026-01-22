import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'accent';
  badge?: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'default',
  badge,
  className
}) => {
  const variants = {
    default: 'bg-card hover:bg-secondary/50',
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-gradient-to-br from-setu-saffron to-setu-saffron-light text-white'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-5 rounded-xl border border-border cursor-pointer card-hover',
        'transition-all duration-300 group',
        variants[variant],
        className
      )}
    >
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full bg-setu-saffron text-white">
          {badge}
        </span>
      )}
      
      <div className={cn(
        'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
        'transition-transform duration-300 group-hover:scale-110',
        variant === 'default' ? 'bg-primary/10' : 'bg-white/20'
      )}>
        <Icon className={cn(
          'w-6 h-6',
          variant === 'default' ? 'text-primary' : 'text-current'
        )} />
      </div>
      
      <h3 className={cn(
        'font-semibold text-lg mb-1',
        variant === 'default' ? 'text-foreground' : 'text-current'
      )}>
        {title}
      </h3>
      
      <p className={cn(
        'text-sm',
        variant === 'default' ? 'text-muted-foreground' : 'text-current/80'
      )}>
        {description}
      </p>
    </div>
  );
};
