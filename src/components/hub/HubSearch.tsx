import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResourceSearch } from '@/hooks/useResources';
import { EXAM_META, RESOURCE_TYPE_META, type Exam } from '@/types/hub';

interface HubSearchProps {
  activeExam: Exam;
}

export const HubSearch: React.FC<HubSearchProps> = ({ activeExam }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { results, loading } = useResourceSearch(query);
  const examMeta = EXAM_META[activeExam];

  useEffect(() => {
    setOpen(results.length > 0 && query.length >= 2);
  }, [results, query]);

  const handleSelect = (resourceId: string) => {
    navigate(`/resource/${resourceId}`);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${open || query ? examMeta.border : 'rgba(255,255,255,0.1)'}`,
          boxShadow: open || query ? `0 0 0 4px ${examMeta.color}15` : 'none',
        }}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: examMeta.color }} />
          : <Search className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
        }
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search notes, PYQs, tests, formulas..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }}>
            <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        )}
        <span className="hidden sm:block text-[10px] font-mono px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
          ⌘K
        </span>
      </div>

      {/* Results dropdown */}
      {open && (
        <div
          className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden z-50 shadow-2xl"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {results.map(r => {
            const typeMeta = RESOURCE_TYPE_META[r.resource_type];
            return (
              <button
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
              >
                <span className="text-lg">{typeMeta.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.title}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {r.subject} · {r.exam.toUpperCase()} Class {r.class}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: typeMeta.bg, color: typeMeta.color }}
                >{typeMeta.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
