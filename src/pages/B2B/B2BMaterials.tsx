import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, FileText, Upload, Link as LinkIcon, Trash2, Loader2, X } from 'lucide-react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TopicSelector } from '@/components/practice/TopicSelector';
import { cn } from '@/lib/utils';

interface TeacherTask {
  id: string;
  node_id: string;
  title: string;
  description: string;
  deadline: string;
  target_student_ids: string[] | null;
  created_at: string;
  node_name?: string;
}

export default function B2BResourceCenter() {
  const { profile, user } = useAuth();
  const [tasks, setTasks] = useState<TeacherTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPushTask, setShowPushTask] = useState(false);
  const [pushForm, setPushForm] = useState({
    node_id: '',
    title: '',
    description: '',
    deadline: '',
  });
  const [pushing, setPushing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [profile]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      if (!profile?.user_id) return;

      const { data, error } = await supabase
        .from('teacher_tasks' as any)
        .select('*, learning_nodes(name)')
        .eq('teacher_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((t: any) => ({
        ...t,
        node_name: t.learning_nodes?.name || 'Unknown'
      }));
      setTasks(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePushTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushForm.node_id || !pushForm.title) {
      toast.error('Please select a topic and enter a title');
      return;
    }

    setPushing(true);
    try {
      const { error } = await supabase
        .from('teacher_tasks' as any)
        .insert({
          teacher_id: user?.id,
          node_id: pushForm.node_id,
          title: pushForm.title,
          description: pushForm.description,
          deadline: pushForm.deadline || null
        });

      if (error) throw error;

      toast.success('Task pushed to all students!');
      setShowPushTask(false);
      setPushForm({ node_id: '', title: '', description: '', deadline: '' });
      fetchTasks();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPushing(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await supabase.from('teacher_tasks' as any).delete().eq('id', id);
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Task removed');
    } catch {
      toast.error('Failed to remove task');
    }
  };

  return (
    <B2BSidebarLayout title="Resource Center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-foreground">Resource Center</h1>
            <p className="text-muted-foreground mt-1 text-base font-medium">Push specific syllabus topics as priority tasks to your students.</p>
          </div>
          <Button 
            onClick={() => setShowPushTask(!showPushTask)} 
            className={cn("h-12 rounded-xl transition-all font-black px-6", showPushTask ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-accent text-primary shadow-lg shadow-accent/20")}
          >
            {showPushTask ? 'Cancel' : <><Plus className="w-5 h-5 mr-2" />Push New Task</>}
          </Button>
        </div>

        {showPushTask && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border-2 border-accent/20 p-8 rounded-[2rem] shadow-xl mb-6">
            <h2 className="text-xl font-black text-foreground mb-6">Create New Task</h2>
            <form onSubmit={handlePushTask} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase text-muted-foreground ml-1">Task Title</label>
                  <input
                    type="text" required placeholder="e.g. Master Laws of Motion"
                    value={pushForm.title} onChange={e => setPushForm({ ...pushForm, title: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-base font-bold text-foreground focus:outline-none focus:border-accent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black uppercase text-muted-foreground ml-1">Curriculum Topic</label>
                  <div className="bg-secondary/50 border border-border rounded-2xl p-4">
                    {pushForm.node_id ? (
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-accent">{tasks.find(t => t.node_id === pushForm.node_id)?.node_name || 'Topic Selected'}</span>
                            <Button variant="ghost" size="sm" onClick={() => setPushForm({...pushForm, node_id: ''})}>Change</Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-muted-foreground font-bold mb-2">SELECT A TOPIC FROM CURRICULUM:</p>
                            <TopicSelector onSelect={(id, name) => setPushForm({ ...pushForm, node_id: id, title: pushForm.title || `Master ${name}` })} />
                        </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase text-muted-foreground ml-1">Instructions (Optional)</label>
                <textarea
                  placeholder="e.g. Solve at least 20 PYQs and aim for >80% accuracy."
                  rows={3}
                  value={pushForm.description} onChange={e => setPushForm({ ...pushForm, description: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-base font-bold text-foreground focus:outline-none focus:border-accent transition-all resize-none"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                 <div className="flex-1 space-y-2">
                    <label className="text-sm font-black uppercase text-muted-foreground ml-1">Deadline (Optional)</label>
                    <input
                      type="datetime-local"
                      value={pushForm.deadline} onChange={e => setPushForm({ ...pushForm, deadline: e.target.value })}
                      className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-base font-bold text-foreground focus:outline-none focus:border-accent transition-all"
                    />
                 </div>
                 <div className="flex-1 flex items-end">
                    <Button type="submit" disabled={pushing} className="w-full bg-accent text-primary font-black h-14 rounded-2xl shadow-lg shadow-accent/20 text-lg">
                      {pushing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Target className="w-5 h-5 mr-2" />}
                      Push Task to Students
                    </Button>
                 </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* Task List */}
        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                    <th className="px-8 py-5">Task Details</th>
                    <th className="px-8 py-5">Curriculum Node</th>
                    <th className="px-8 py-5">Assigned On</th>
                    <th className="px-8 py-5">Deadline</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-accent/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-foreground text-lg">{task.title}</p>
                            <p className="text-xs text-muted-foreground font-medium line-clamp-1">{task.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black bg-white border border-border text-foreground shadow-sm">
                          <BookOpen className="w-3 h-3 text-accent" />
                          {task.node_name}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-muted-foreground font-bold">
                        {new Date(task.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-8 py-6">
                        {task.deadline ? (
                          <span className="text-sm font-bold text-foreground">
                            {new Date(task.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">No deadline</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-3 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-2xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                           <BookOpen className="w-10 h-10 text-muted-foreground opacity-30" />
                        </div>
                        <p className="text-lg font-black text-foreground">No active tasks</p>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                           Motivate your students by assigning specific topics they need to master.
                        </p>
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
