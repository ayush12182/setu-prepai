import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldAlert, Sparkles, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusWidgetMode = 'ai' | 'offline' | 'recovery' | 'idle' | 'fetching';

interface QuestionStatusWidgetProps {
  mode: StatusWidgetMode;
  className?: string;
}

export const QuestionStatusWidget: React.FC<QuestionStatusWidgetProps> = ({ mode, className }) => {
  return null;
};
