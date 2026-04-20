import React from 'react';
import { cn } from '@/lib/utils';
import { getBadgeForPoints } from '@/data/circlesData';

interface ReputationBadgeProps {
    points: number;
    size?: 'sm' | 'md';
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({ points, size = 'sm' }) => {
    const badge = getBadgeForPoints(points);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full font-medium border',
                badge.color,
                'bg-current/10 border-current/20',
                size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
            )}
            style={{ background: 'currentColor' }}
        >
            {/* Use a wrapper to handle the color properly */}
            <span className={cn(
                'inline-flex items-center gap-1 rounded-full font-medium',
                badge.color,
                size === 'sm' ? 'text-[10px]' : 'text-xs'
            )}>
                <span>{badge.icon}</span>
                <span style={{ opacity: 1 }}>{badge.badge}</span>
            </span>
        </span>
    );
};

// Simplified clean version
export const BadgeChip: React.FC<{ points: number; size?: 'sm' | 'md' }> = ({ points, size = 'sm' }) => {
    const badge = getBadgeForPoints(points);
    const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

    const colorMap: Record<string, string> = {
        'Beginner': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        'Contributor': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        'Doubt Solver': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        'Top Mentor': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };

    return (
        <span className={cn(
            'inline-flex items-center gap-0.5 rounded-full font-semibold border',
            sizeClass,
            colorMap[badge.badge] ?? colorMap['Beginner']
        )}>
            {badge.icon} {badge.badge}
        </span>
    );
};
