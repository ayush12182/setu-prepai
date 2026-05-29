import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, Bookmark, BookmarkCheck, Lock, ExternalLink } from 'lucide-react';
import {
  RESOURCE_TYPE_META,
  SUB_TYPE_META,
  EXAM_META,
  type Resource,
  type Exam,
} from '@/types/hub';

interface ResourceCardProps {
  resource: Resource;
  isBookmarked?: boolean;
  onBookmark?: (id: string) => void;
  onView?: (resource: Resource) => void;
  delay?: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const CLASS_LABEL: Record<string, string> = { '11': 'Class 11', '12': 'Class 12', dropper: 'Dropper' };

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource: r,
  isBookmarked = false,
  onBookmark,
  onView,
  delay = 0,
}) => {
  const typeMeta = RESOURCE_TYPE_META[r.resource_type];
  const subMeta = r.sub_type ? SUB_TYPE_META[r.sub_type] : null;
  const examMeta = EXAM_META[r.exam as Exam];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative flex flex-col rounded-2xl overflow-hidden group transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      whileHover={{
        background: 'rgba(255,255,255,0.055)',
        borderColor: `${typeMeta.color}40`,
        y: -2,
      }}
    >
      {/* Top colour bar */}
      <div className="h-0.5 w-full" style={{ background: typeMeta.color }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {/* Resource type */}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: typeMeta.bg, color: typeMeta.color }}
            >
              {subMeta ? subMeta.label : typeMeta.label}
            </span>
            {/* Exam tag */}
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: examMeta.bg, color: examMeta.color }}
            >
              {examMeta.emoji} {examMeta.label} {CLASS_LABEL[r.class]}
            </span>
          </div>
          {/* Premium lock */}
          {r.is_premium && (
            <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
              <Lock className="w-2.5 h-2.5" /> PRO
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex items-start gap-2.5">
          <span className="text-xl mt-0.5 shrink-0">{subMeta?.icon ?? typeMeta.icon}</span>
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">{r.title}</h3>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span className="truncate">{r.subject}</span>
          <span>·</span>
          <span className="truncate">{r.chapter}</span>
          {r.pages && <><span>·</span><span>{r.pages}p</span></>}
        </div>

        {/* Description */}
        {r.description && (
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {r.description}
          </p>
        )}

        {/* Difficulty */}
        {r.difficulty && (
          <div className="flex items-center gap-1.5">
            {['easy', 'medium', 'hard'].map((d, i) => (
              <div
                key={d}
                className="h-1 flex-1 rounded-full transition-all"
                style={{
                  background: i <= ['easy', 'medium', 'hard'].indexOf(r.difficulty!)
                    ? r.difficulty === 'easy' ? '#10B981'
                      : r.difficulty === 'medium' ? '#F59E0B' : '#EF4444'
                    : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
            <span className="text-[10px] ml-1 capitalize" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {r.difficulty}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Updated {timeAgo(r.updated_at)}
          </span>

          <div className="flex items-center gap-1">
            {/* Bookmark */}
            {onBookmark && (
              <button
                onClick={e => { e.stopPropagation(); onBookmark(r.id); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              >
                {isBookmarked
                  ? <BookmarkCheck className="w-3.5 h-3.5" style={{ color: examMeta.color }} />
                  : <Bookmark className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
                }
              </button>
            )}

            {/* Download */}
            {r.content_url && (
              <a
                href={r.content_url}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              >
                <Download className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
              </a>
            )}

            {/* View */}
            <button
              onClick={() => onView?.(r)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: typeMeta.bg,
                color: typeMeta.color,
              }}
            >
              View <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
