import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, FileText, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getSubjectLabels, getSubjectsForExam } from '@/lib/streamSubjects';

// Initial mock materials — will be replaced with live Supabase data
const BASE_MATERIALS = [
  { id: '1', batch: 'Batch A', subject: 'Physics', chapter: 'Kinematics', type: 'pdf', title: 'Chapter 1 Complete Notes.pdf', pages: 12, date: 'Oct 12, 2025' },
  { id: '2', batch: 'Batch B', subject: 'Chemistry', chapter: 'Atomic Structure', type: 'link', title: 'Interactive Board Notes', pages: 8, date: 'Oct 15, 2025' },
  { id: '3', batch: 'Crash Course', subject: 'Mathematics', chapter: 'Calculus – Limits', type: 'pdf', title: 'Short Summary Notes.pdf', pages: 15, date: 'Nov 02, 2025' },
];

export default function B2BMaterials() {
  const { profile } = useAuth();
  const subjects = getSubjectLabels(profile?.target_exam);
  const firstSubject = subjects[0] || 'Physics';

  const [materials, setMaterials] = useState(BASE_MATERIALS.map(m => ({ ...m, subject: subjects[0] || m.subject })));
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ subject: firstSubject, chapter: '', title: '', pages: 10, type: 'pdf' });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.chapter || !uploadForm.title) {
      toast.error('Please fill in all fields');
      return;
    }

    const newDoc = {
      id: Date.now().toString(),
      batch: 'All Batches',
      subject: uploadForm.subject,
      chapter: uploadForm.chapter,
      type: uploadForm.type,
      title: uploadForm.title,
      pages: uploadForm.pages,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    setMaterials([newDoc, ...materials]);
    toast.success('Study material distributed successfully to all student hubs!');
    setShowUpload(false);
    setUploadForm({ subject: firstSubject, chapter: '', title: '', pages: 10, type: 'pdf' });
  };

  const deleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    toast.success('Material revoked from students');
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
            {showUpload ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Upload Notes</>}
          </Button>
        </div>

        {showUpload && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border p-6 rounded-3xl shadow-sm mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Upload New Material</h2>
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <select 
                  value={uploadForm.subject} onChange={e => setUploadForm({...uploadForm, subject: e.target.value})}
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
                  value={uploadForm.chapter} onChange={e => setUploadForm({...uploadForm, chapter: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Document Title</label>
                <input 
                  type="text" required placeholder="e.g. Final Recap Notes.pdf"
                  value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Page Count</label>
                  <input 
                    type="number" min="1" max="500" required
                    value={uploadForm.pages} onChange={e => setUploadForm({...uploadForm, pages: parseInt(e.target.value) || 0})}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Type</label>
                  <select 
                    value={uploadForm.type} onChange={e => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                  >
                    <option value="pdf">PDF File</option>
                    <option value="link">Web Link</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 pt-2">
                <Button type="submit" className="w-full bg-accent text-primary-foreground h-12">
                  <Upload className="w-4 h-4 mr-2" /> Distribute to Student Hub
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                  <th className="px-6 py-4 font-bold">Document</th>
                  <th className="px-6 py-4 font-bold">Subject / Chapter</th>
                  <th className="px-6 py-4 font-bold">Batch</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center \${mat.type === 'pdf' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
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
                        {mat.batch}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {mat.date}
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
        </div>

      </motion.div>
    </B2BSidebarLayout>
  );
}
