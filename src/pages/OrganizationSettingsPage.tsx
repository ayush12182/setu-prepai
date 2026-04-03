import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useB2BManager } from '@/hooks/useB2BManager';
import { Button } from '@/components/ui/button';
import {
  Building2, Users, Layers, ShieldCheck, Mail, Map, Save,
  Plus, CheckCircle2, ChevronRight, GraduationCap, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrganizationSettingsPage() {
  const { profile, isInstitution } = useAuth();
  const { saveCustomSyllabus, loading } = useB2BManager();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'syllabus' | 'team'>('syllabus');
  
  // Custom Syllabus Form State
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [globalRef, setGlobalRef] = useState('');
  
  const handleSaveSyllabus = async () => {
    if (!chapter.trim() || !topic.trim()) return;
    const success = await saveCustomSyllabus(subject, chapter, topic, globalRef);
    if (success) {
      setChapter('');
      setTopic('');
      setGlobalRef('');
    }
  };

  if (!isInstitution) {
    return (
      <MainLayout title="Organization Settings">
        <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground">
          <ShieldCheck className="w-16 h-16 mb-4 text-border" />
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="mt-2 text-sm max-w-sm">You must have an Institution or Admin role to access organization settings.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Organization Settings">
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-accent" />
              <span className="text-sm font-bold uppercase tracking-widest text-accent">Org Settings</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Institution Hub
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your custom syllabus, mentors, and global organization profile.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'profile', label: 'Org Profile', icon: Building2 },
            { id: 'syllabus', label: 'Custom Syllabus', icon: Layers },
            { id: 'team', label: 'Mentors & Team', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-card text-foreground shadow-sm border border-border' 
                  : 'text-muted-foreground hover:bg-secondary/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'syllabus' && (
            <motion.div
              key="syllabus"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Syllabus Builder Form */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-24">
                  <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-accent" /> Add Syllabus Item
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Subject</label>
                      <select 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                      >
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Maths">Mathematics</option>
                        <option value="Biology">Biology</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Custom Chapter Name</label>
                      <input 
                        placeholder="e.g. Unit 1: Mechanics"
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Custom Topic Name</label>
                      <input 
                        placeholder="e.g. 1.2 Intro to Kinematics"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Global SETU Topic (Map)</label>
                      <input 
                        placeholder="e.g. Kinematics (1D)"
                        value={globalRef}
                        onChange={(e) => setGlobalRef(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                        This tells the SETU AI which question bank to pull from when automatically generating tests for your custom topic.
                      </p>
                    </div>

                    <Button 
                      onClick={handleSaveSyllabus}
                      disabled={loading || !chapter.trim() || !topic.trim()}
                      className="w-full h-11 bg-accent text-white font-bold rounded-xl shadow-lg mt-2"
                    >
                      <Save size={16} className="mr-2" />
                      {loading ? 'Saving...' : 'Save Syllabus Mapping'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Syllabus Preview/List */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm min-h-[500px]">
                  <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <Map className="w-4 h-4 text-purple-500" /> Current Custom Structure
                  </h3>
                  
                  <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">As you add custom layers, your personalized Syllabus Index will appear here.</p>
                    <p className="text-xs mt-1">This overrides the student practice flow to follow your institute's pacing.</p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-3xl p-6 shadow-sm"
            >
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                     <GraduationCap className="w-5 h-5 text-accent" /> Mentor Provisioning
                   </h3>
                   <p className="text-xs text-muted-foreground mt-1">Manage staff access to your dashboards</p>
                 </div>
                 <Button className="h-9 px-4 rounded-xl bg-accent text-white text-xs font-bold">
                   <Mail size={14} className="mr-2" /> Invite Mentor
                 </Button>
               </div>
               
               <div className="border border-border rounded-2xl overflow-hidden text-sm">
                 <div className="bg-secondary/30 p-4 border-b border-border flex justify-between font-bold text-muted-foreground">
                   <span>Mentor</span>
                   <span>Status</span>
                 </div>
                 <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors border-b border-border">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center">JB</div>
                     <span className="font-semibold text-foreground">Jeetu Bhaiya</span>
                   </div>
                   <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
                 </div>
                 <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground font-bold flex items-center justify-center">AK</div>
                     <span className="font-semibold text-foreground">Alakh Pandey (Pending)</span>
                   </div>
                   <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">Invited</span>
                 </div>
               </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </MainLayout>
  );
}
