import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssignedContent, AssignedTest, AssignedMaterial } from '@/hooks/useAssignedContent';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Play, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

type SortableItemType = (AssignedTest | AssignedMaterial) & { 
  sortPriority: number; 
  itemType: 'test' | 'material';
};

export const AssignedContent: React.FC = () => {
  const { data, loading, markAsSeen } = useAssignedContent();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tests' | 'materials'>('tests');

  // Pre-process items mapping
  const testsItems = useMemo(() => {
    if (!data) return [];
    const items: SortableItemType[] = data.tests.map(t => {
      let priority = 3; // Pending / Not Attempted
      if (t.status === 'completed' || t.status === 'attempted') priority = 4;
      else if (t.status === 'overdue') priority = 1;
      else if (t.due_date) {
        const days = differenceInDays(new Date(t.due_date), new Date());
        if (days >= 0 && days <= 3) priority = 2; // Due soon
      }
      return { ...t, sortPriority: priority, itemType: 'test' };
    });
    
    return items.sort((a, b) => {
      if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      return 0;
    });
  }, [data]);

  const materialsItems = useMemo(() => {
    if (!data) return [];
    const items: SortableItemType[] = data.materials.map(m => {
      return { ...m, sortPriority: 3, itemType: 'material' }; // Default pending priority
    });
    return items.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }, [data]);

  const handleTestClick = (test: AssignedTest) => {
    if (!test.is_seen) markAsSeen(test.id);
    navigate(`/assess/${test.reference_id}`);
  };

  const handleMaterialClick = (material: AssignedMaterial) => {
    if (!material.is_seen) markAsSeen(material.id);
    navigate(`/materials/${material.reference_id}`);
  };

  if (loading) {
    return (
      <div className="w-full h-48 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-t-2 border-accent animate-spin" />
      </div>
    );
  }

  const currentItems = activeTab === 'tests' ? testsItems : materialsItems;

  return (
    <div className="mt-8 flex flex-col pt-6">
      
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 pt-6 border-t border-white/5">
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
            Assigned by Your Teacher
            {(data?.alerts?.overdue || 0) > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 h-fit translate-y-[-2px]">
                <AlertCircle className="w-3 h-3" />
                {data!.alerts.overdue} Overdue
              </span>
            )}
          </h3>
          <p className="text-white/40 text-sm mt-2 font-medium">Keep up with your mentor's syllabus plan</p>
        </div>

        <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.05] h-fit self-start w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('tests')}
            className={cn(
              "flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
              activeTab === 'tests' 
                ? "bg-white/10 text-white shadow-lg" 
                : "text-white/40 hover:text-white/70"
            )}
          >
            Tests ({testsItems.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={cn(
              "flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
              activeTab === 'materials' 
                ? "bg-white/10 text-white shadow-lg" 
                : "text-white/40 hover:text-white/70"
            )}
          >
            Materials ({materialsItems.length})
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <AnimatePresence mode="popLayout">
        {!currentItems.length ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full py-16 rounded-[2rem] bg-[#1A1F2C] border border-white/[0.05] flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center">
               <BookOpen className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 font-medium italic">No {activeTab} from your mentor yet.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {currentItems.map((item, index) => {
              
              let Badge = null;
              let BorderColor = 'border-white/[0.05]';
              let HeaderIcon = null;

              if (item.sortPriority === 1) {
                BorderColor = 'border-red-500/30';
                Badge = <span className="text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3 inline mr-1"/>Overdue</span>;
              } else if (item.sortPriority === 2) {
                BorderColor = 'border-yellow-500/30';
                Badge = <span className="text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider flex items-center gap-1"><Clock className="w-3 h-3 inline mr-1"/>Due Soon</span>;
              } else if (item.sortPriority === 4) {
                BorderColor = 'border-emerald-500/30';
                Badge = <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3 inline mr-1"/>Attempted</span>;
              } else {
                Badge = <span className="text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider w-fit">Not Attempted</span>;
              }

              if (item.itemType === 'test') {
                HeaderIcon = <Play className="w-5 h-5 text-white/70 ml-0.5" />;
              } else {
                HeaderIcon = <FileText className="w-5 h-5 text-blue-400" />;
              }

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id}
                  className={cn(
                    "relative flex flex-col justify-between h-full bg-[#1A1F2C] rounded-[1.5rem] p-6 border transition-all duration-300 hover:scale-[1.02] cursor-pointer group hover:bg-[#1f2536]",
                    BorderColor
                  )}
                  onClick={() => item.itemType === 'test' ? handleTestClick(item as AssignedTest) : handleMaterialClick(item as AssignedMaterial)}
                >
                  {!item.is_seen && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <span className="relative flex h-6 w-auto items-center px-4 bg-accent text-[10px] font-black uppercase text-primary tracking-widest rounded-full shadow-lg shadow-accent/20">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-30 top-0 left-0"></span>
                        NEW FROM YOUR MENTOR
                      </span>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center">
                        {HeaderIcon}
                      </div>
                      {item.itemType === 'test' && Badge}
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-sm font-medium text-white/40 truncate">{item.subject}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/30 pt-2">
                      {item.itemType === 'test' ? (
                        <>
                          <span>{(item as AssignedTest).questions} Qs</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                          <span>{(item as AssignedTest).duration} Min</span>
                        </>
                      ) : (
                        <>
                          <span>{(item as AssignedMaterial).type.toUpperCase()} DOCUMENT</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-xs font-medium text-white/50">
                      {item.itemType === 'test' 
                        ? (item.due_date ? `Due ${format(new Date(item.due_date), 'MMM d, yyyy')}` : 'No due date')
                        : (item.uploaded_at ? `Uploaded ${format(new Date((item as AssignedMaterial).uploaded_at), 'MMM d, yyyy')}` : '')}
                    </span>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "rounded-xl font-black uppercase tracking-widest text-[10px] h-9",
                        item.itemType === 'test' 
                          ? (item.sortPriority === 4 ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" : "text-white hover:text-accent hover:bg-white/5 bg-white/5 border border-white/5")
                          : "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      )}
                    >
                      {item.itemType === 'test' ? (item.sortPriority === 4 ? 'View Result' : 'Start Test') : 'View Material'}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
