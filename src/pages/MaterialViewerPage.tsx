import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, ExternalLink, FileText, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function MaterialViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaterial() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('batch_materials')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setMaterial(data);
      } catch (error) {
        console.error('Error fetching material:', error);
        toast.error('Failed to load material. It may have been removed.');
        navigate('/student-hub');
      } finally {
        setLoading(false);
      }
    }
    loadMaterial();
  }, [id, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </MainLayout>
    );
  }

  if (!material) return null;

  return (
    <MainLayout>
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4">
          
          <div className="mb-8 flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/student-hub')}
              className="text-white hover:text-accent font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            
            <Button onClick={() => window.open(material.url || '#', '_blank')} className="bg-accent text-primary font-bold hover:bg-accent/90">
              <ExternalLink className="w-4 h-4 mr-2" /> Open Externally
            </Button>
          </div>

          <div className="bg-[#1A1F2C] rounded-[2rem] border border-white/[0.05] p-8 overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                {material.type === 'video' ? <Play className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{material.title}</h1>
                <p className="text-white/40">{material.subject} • {material.chapter || 'Material'}</p>
              </div>
            </div>

            <div className="w-full bg-black/50 rounded-2xl overflow-hidden" style={{ minHeight: '65vh' }}>
              {material.url ? (
                <iframe 
                  src={material.url} 
                  className="w-full h-full min-h-[65vh] border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[65vh] text-white/40">
                  No preview available
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
}
