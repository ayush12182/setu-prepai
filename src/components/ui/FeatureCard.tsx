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
    primary: 'bg-primary',
    accent: 'bg-gradient-to-br from-accent to-setu-saffron-light'
  };

  // Text colors based on variant
  const getTitleColor = () => {
    if (variant === 'default') return 'text-foreground';
    return 'text-white';
  };

  const getDescColor = () => {
    if (variant === 'default') return 'text-secondary-foreground';
    return 'text-white/90';
  };

  const getIconBg = () => {
    if (variant === 'default') return 'bg-primary/10';
    return 'bg-white/20';
  };

  const getIconColor = () => {
    if (variant === 'default') return 'text-primary';
    return 'text-white';
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
        <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full bg-accent text-white">
          {badge}
        </span>
      )}
      
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
        'transition-transform duration-300 group-hover:scale-110',
        getIconBg()
      )}>
        <Icon className={cn('w-6 h-6', getIconColor())} />
      </div>
      
      <h3 className={cn('font-medium text-lg mb-1.5 leading-tight', getTitleColor())}>
        {title}
      </h3>
      
      <p className={cn('text-sm leading-relaxed', getDescColor())}>
        {description}
      </p>
    </div>
  );
};
