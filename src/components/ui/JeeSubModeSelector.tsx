import React from 'react';
import { cn } from '@/lib/utils';
import { useExamMode, JeeSubMode, JEE_SUB_MODE_LABELS } from '@/contexts/ExamModeContext';

const options: { mode: JeeSubMode; label: string; short: string; description: string }[] = [
    {
        mode: 'main',
        label: 'JEE Main',
        short: 'Main',
        description: 'NCERT-level MCQs, Mains PYQs, conceptual clarity',
    },
    {
        mode: 'advanced',
        label: 'JEE Advanced',
        short: 'Advanced',
        description: 'Integer-type, paragraph-based, Kota-level depth',
    },
    {
        mode: 'both',
        label: 'Main + Advanced',
        short: 'Both',
        description: 'Balanced mix of Mains & Advanced content',
    },
];

export const JeeSubModeSelector: React.FC = () => {
    const { isJee, jeeSubMode, setJeeSubMode } = useExamMode();

    if (!isJee) return null;

    return (
        <div className="flex items-center gap-1 bg-secondary/60 border border-border rounded-xl p-1">
            {options.map((opt) => {
                const isActive = jeeSubMode === opt.mode;
                return (
                    <button
                        key={opt.mode}
                        onClick={() => setJeeSubMode(opt.mode)}
                        title={opt.description}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap',
                            isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )}
                    >
                        {opt.short}
                    </button>
                );
            })}
        </div>
    );
};

export default JeeSubModeSelector;
