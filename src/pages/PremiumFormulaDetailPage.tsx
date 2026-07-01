import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { PremiumFormulaView } from '@/components/revision/PremiumFormulaView';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BrainCircuit, Activity, Pin, Clock, Library } from 'lucide-react';

const PremiumFormulaDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { subject, chapter } = useParams<{ subject: string; chapter: string }>();
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterId = async () => {
      if (!subject || !chapter) return;
      
      try {
        const { data, error } = await supabase
          .from('revision_chapter_metadata')
          .select('id')
          .eq('subject', subject)
          .ilike('chapter_name', decodeURIComponent(chapter)) 
          .single();

        if (error) {
           console.error(error);
        } else if (data) {
           setChapterId(data.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChapterId();
  }, [subject, chapter]);

  if (loading) {
    return (
      <MainLayout title="Formula Sheet">
        <div className="flex h-64 items-center justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!chapterId) {
    return (
      <MainLayout title="Formula Sheet">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
           <p className="text-gray-500 mb-8">The knowledge base for {decodeURIComponent(chapter || '')} hasn't been generated yet.</p>
           <button 
             onClick={() => navigate('/revision/formulas')}
             className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90"
           >
             Back to Library
           </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${decodeURIComponent(chapter || '')} Formulas`}>
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        
        {/* Detail Page Layout: Main Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Formula Feed */}
          <div className="flex-1 min-w-0">
            <PremiumFormulaView 
              chapterId={chapterId}
              chapterName={decodeURIComponent(chapter || '')}
              subject={subject || 'Unknown Subject'}
              onBack={() => navigate('/revision/formulas')}
            />
          </div>

          {/* Reserved Sidebar (Future Features) */}
          <div className="hidden lg:flex w-80 flex-col gap-6 shrink-0 pt-[88px]">
            
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-500" />
                Adaptive AI
              </h3>
              <div className="space-y-3">
                <div className="h-10 bg-gray-50 rounded-lg flex items-center px-3 text-xs text-gray-400 border border-gray-100 border-dashed">
                  AI Revision Strategy (Soon)
                </div>
                <div className="h-10 bg-gray-50 rounded-lg flex items-center px-3 text-xs text-gray-400 border border-gray-100 border-dashed">
                  Weak Concepts Analysis (Soon)
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Your Analytics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Time Spent: <strong className="text-gray-900">0m</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Library className="w-4 h-4 text-gray-400" />
                  <span>Formulas Mastered: <strong className="text-gray-900">0</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Pin className="w-4 h-4 text-gray-400" />
                  <span>Bookmarked: <strong className="text-gray-900">0</strong></span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default PremiumFormulaDetailPage;
