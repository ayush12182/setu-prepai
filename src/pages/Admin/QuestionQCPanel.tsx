import React, { useState, useEffect } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Edit, Tags, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function QuestionQCPanel() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    fetchPendingQuestions();
  }, []);

  const fetchPendingQuestions = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('questions')
      .select('*')
      .eq('is_verified', false)
      .order('created_at', { ascending: false });
      
    if (data) setQuestions(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await (supabase as any).from('questions').update({ is_verified: true }).eq('id', id);
    if (!error) {
      toast.success('Question verified and live!');
      setQuestions(q => q.filter(item => item.id !== id));
    } else {
      toast.error('Failed to verify question');
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await (supabase as any).from('questions').delete().eq('id', id);
    if (!error) {
      toast.success('Question discarded from bank');
      setQuestions(q => q.filter(item => item.id !== id));
    }
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setEditForm({ ...q });
  };

  const saveEdit = async () => {
    const { id, ...updates } = editForm;
    const { error } = await (supabase as any).from('questions').update(updates).eq('id', id);
    if (!error) {
      toast.success('Changes saved successfully');
      setQuestions(q => q.map(item => item.id === id ? editForm : item));
      setEditingId(null);
    }
  };

  return (
    <B2BSidebarLayout title="QC Panel">
      <div className="space-y-6 max-w-6xl">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold">Question QC Panel</h1>
            <p className="text-muted-foreground mt-1 text-sm">Review, edit, and approve AI-ingested questions for the static and adaptive engine.</p>
          </div>
          <div className="bg-accent/10 text-accent font-bold px-4 py-2 rounded-xl text-sm border border-accent/20">
            {questions.length} Pending Verification
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading queue...</div>
        ) : questions.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
            <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Queue is empty!</h3>
            <p className="text-sm text-muted-foreground mt-2">All ingested AI questions have been verified.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map(q => (
              <div key={q.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                
                {editingId === q.id ? (
                  <div className="space-y-4">
                    <div className="text-sm font-bold text-accent mb-4">Editing Question Mode</div>
                    <textarea 
                      className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent"
                      value={editForm.question_text}
                      onChange={e => setEditForm({...editForm, question_text: e.target.value})}
                      rows={3}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {editForm.options.map((opt: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                           <input type="radio" checked={editForm.correct_index === i} onChange={() => setEditForm({...editForm, correct_index: i})} />
                           <input 
                             className="flex-1 bg-secondary border border-border rounded-lg p-2 text-xs" 
                             value={opt} 
                             onChange={e => {
                               const newOpts = [...editForm.options];
                               newOpts[i] = e.target.value;
                               setEditForm({...editForm, options: newOpts});
                             }} 
                           />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div>
                         <label className="text-xs uppercase text-muted-foreground">Difficulty (1-5)</label>
                         <input className="w-full bg-secondary border border-border p-2 rounded-lg text-xs" value={editForm.difficulty} onChange={e => setEditForm({...editForm, difficulty: e.target.value})} />
                       </div>
                       <div>
                         <label className="text-xs uppercase text-muted-foreground">Subtopic</label>
                         <input className="w-full bg-secondary border border-border p-2 rounded-lg text-xs" value={editForm.subtopic} onChange={e => setEditForm({...editForm, subtopic: e.target.value})} />
                       </div>
                       <div>
                         <label className="text-xs uppercase text-muted-foreground">Mistake Type</label>
                         <input className="w-full bg-secondary border border-border p-2 rounded-lg text-xs" value={editForm.mistake_type} onChange={e => setEditForm({...editForm, mistake_type: e.target.value})} />
                       </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-border">
                       <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                       <Button className="bg-accent text-white" onClick={saveEdit}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Header Tags */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-secondary text-muted-foreground rounded-full border border-border">
                        {q.exam} • Class {q.class}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                        {q.subject} • {q.subtopic}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
                        {q.mistake_type || 'No Mistake Type'}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 flex items-center gap-1">
                        <Tags size={10}/> {q.concept}
                      </span>
                    </div>

                    <div className="text-foreground text-sm font-medium mb-4 whitespace-pre-wrap">{q.question_text}</div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {q.options.map((opt: string, i: number) => (
                        <div key={i} className={`p-3 rounded-xl border text-xs ${q.correct_index === i ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold' : 'bg-secondary/30 border-border text-muted-foreground'}`}>
                          <span className="opacity-50 mr-2">{String.fromCharCode(65 + i)}</span>{opt}
                        </div>
                      ))}
                    </div>

                    <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-accent mb-2">
                        <AlertCircle size={14} /> AI Generated Explanation & Steps
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-3">
                         {Array.isArray(q.solution_steps) ? q.solution_steps.join('\n') : q.explanation}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-border pt-4">
                      <Button onClick={() => handleApprove(q.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9">
                        <Check className="w-4 h-4 mr-2" /> Verify & Publish
                      </Button>
                      <Button onClick={() => startEdit(q)} variant="outline" className="h-9 border-border bg-card">
                        <Edit className="w-4 h-4 mr-2" /> Edit Tags/Content
                      </Button>
                      <Button onClick={() => handleReject(q.id)} variant="ghost" className="h-9 text-red-500 hover:bg-red-500/10 hover:text-red-600 ml-auto p-2">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
                
              </div>
            ))}
          </div>
        )}
      </div>
    </B2BSidebarLayout>
  );
}
