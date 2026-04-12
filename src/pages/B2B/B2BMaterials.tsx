import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, FileText, Upload, Link as LinkIcon, Trash2, Loader2, X } from 'lucide-react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getSubjectLabels } from '@/lib/streamSubjects';

interface Material {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  type: string;
  pages: number;
  batch_id: string | null;
  batch_name?: string;
  created_at: string;
}

export default function B2BMaterials() {
  const { profile, user } = useAuth();
  const subjects = getSubjectLabels(profile?.target_exam);
  const firstSubject = subjects[0] || 'Physics';

  const [materials, setMaterials] = useState<Material[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    subject: firstSubject,
    chapter: '',
    title: '',
    pages: 10,
    type: 'pdf',
    batch_id: '', // empty = all batches
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const orgId = profile?.organization_id;

      // Fetch batches for dropdown
      const { data: batchData } = await (supabase as any)
        .from('batches')
        .select('id, name')
        .eq('is_active', true)
        .eq('organization_id', orgId || '00000000-0000-0000-0000-000000000000');

      setBatches(batchData || []);

      // Fetch materials
      const { data: matData } = await (supabase as any)
        .from('batch_materials')
        .select('*, batches!batch_materials_batch_id_fkey(name)')
        .eq('organization_id', orgId || '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false });

      const rows = (matData || []).map((m: any) => ({
        ...m,
        batch_name: m.batches?.name || 'All Batches',
      }));
      setMaterials(rows);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.chapter || !uploadForm.title) {
      toast.error('Please fill in all fields');
      return;
    }

    const orgId = profile?.organization_id;
    if (!orgId) {
      toast.error('No organization linked. Contact support.');
      return;
    }

    setUploading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('batch_materials')
        .insert({
          organization_id: orgId,
          uploaded_by: user?.id,
          title: uploadForm.title,
          subject: uploadForm.subject,
          chapter: uploadForm.chapter,
          type: uploadForm.type,
          pages: uploadForm.pages,
          batch_id: uploadForm.batch_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Study material distributed to student hubs!');
      setShowUpload(false);
      setUploadForm({ subject: firstSubject, chapter: '', title: '', pages: 10, type: 'pdf', batch_id: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      await (supabase as any).from('batch_materials').delete().eq('id', id);
      setMaterials(materials.filter(m => m.id !== id));
      toast.success('Material removed');
    } catch {
      toast.error('Failed to remove material');
    }
  };

  return (
    <B2BSidebarLayout title="Study Materials">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Study Materials</h1>
            <p className="text-muted-foreground mt-1 text-sm">Distribute chapter-wise notes directly to your students' hub.</p>
          </div>
          <Button onClick={() => setShowUpload(!showUpload)} className="bg-accent text-primary-foreground">
            {showUpload ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" />Upload Notes</>}
          </Button>
        </div>

        {showUpload && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border p-6 rounded-3xl shadow-sm mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Upload New Material</h2>
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Batch</label>
                <select
                  value={uploadForm.batch_id}
                  onChange={e => setUploadForm({ ...uploadForm, batch_id: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="">All Batches</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <select
                  value={uploadForm.subject}
                  onChange={e => setUploadForm({ ...uploadForm, subject: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Chapter Name</label>
                <input
                  type="text" required placeholder="e.g. Journal Entries"
                  value={uploadForm.chapter} onChange={e => setUploadForm({ ...uploadForm, chapter: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Document Title</label>
                <input
                  type="text" required placeholder="e.g. Final Recap Notes.pdf"
                  value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Page Count</label>
                  <input
                    type="number" min="1" max="500" required
                    value={uploadForm.pages} onChange={e => setUploadForm({ ...uploadForm, pages: parseInt(e.target.value) || 0 })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={uploadForm.type} onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                  >
                    <option value="pdf">PDF File</option>
                    <option value="link">Web Link</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 pt-2">
                <Button type="submit" disabled={uploading} className="w-full bg-accent text-primary-foreground h-12">
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Distribute to Student Hub
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4 font-bold">Document</th>
                    <th className="px-6 py-4 font-bold">Subject / Chapter</th>
                    <th className="px-6 py-4 font-bold">Batch</th>
                    <th className="px-6 py-4 font-bold">Added</th>
                    <th className="px-6 py-4 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {materials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mat.type === 'pdf' ? 'bg-rose-500/10 text-rose-500' : mat.type === 'video' ? 'bg-violet-500/10 text-violet-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {mat.type === 'pdf' ? <FileText className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{mat.title}</p>
                            <p className="text-xs text-muted-foreground">{mat.pages} pages</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{mat.subject}</p>
                        <p className="text-xs text-muted-foreground">{mat.chapter}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-accent/10 border border-accent/20 text-accent">
                          {mat.batch_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(mat.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteMaterial(mat.id)}
                          className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {materials.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No materials uploaded yet.</p>
                        <p className="text-xs mt-1">Click 'Upload Notes' to add your first chapter notes.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </motion.div>
    </B2BSidebarLayout>
  );
}
