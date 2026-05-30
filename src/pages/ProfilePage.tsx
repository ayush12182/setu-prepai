import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, User, BookOpen, Target, Phone, Save, Mail, GraduationCap, Trophy, Clock, CheckCircle2, Sparkles, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProfileData {
  full_name: string;
  phone: string;
  class: string;
  target_exam: string;
  avatar_url: string;
}

// Pre-built avatar options
const AVATAR_OPTIONS = [
  { id: 'boy1', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4', label: 'Boy 1' },
  { id: 'boy2', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Jack&backgroundColor=c0aede', label: 'Boy 2' },
  { id: 'boy3', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=George&backgroundColor=ffd5dc', label: 'Boy 3' },
  { id: 'boy4', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Leo&backgroundColor=d1f4d1', label: 'Boy 4' },
  { id: 'girl1', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka&backgroundColor=ffdfbf', label: 'Girl 1' },
  { id: 'girl2', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sophia&backgroundColor=b6e3f4', label: 'Girl 2' },
  { id: 'girl3', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Lily&backgroundColor=c0aede', label: 'Girl 3' },
  { id: 'girl4', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Mia&backgroundColor=ffd5dc', label: 'Girl 4' },
  { id: 'neutral1', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Max&backgroundColor=d1f4d1', label: 'Style 1' },
  { id: 'neutral2', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sam&backgroundColor=ffdfbf', label: 'Style 2' },
  { id: 'neutral3', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Alex&backgroundColor=b6e3f4', label: 'Style 3' },
  { id: 'neutral4', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Riley&backgroundColor=c0aede', label: 'Style 4' },
];

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { setExamMode } = useExamMode();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [stats, setStats] = useState({ tests: 0, questions: 0, studyHours: 0, accuracy: 0 });
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone: '',
    class: '',
    target_exam: 'JEE Main',
    avatar_url: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          class: data.class || '',
          target_exam: data.target_exam || 'JEE Main',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [practiceRes, testRes] = await Promise.all([
        supabase.from('user_practice_stats').select('*').eq('user_id', user!.id).maybeSingle(),
        supabase.from('major_test_attempts').select('id').eq('user_id', user!.id).eq('status', 'completed'),
      ]);
      const p = practiceRes.data;
      const totalQ = p?.total_questions_solved || 0;
      const totalCorrect = p?.total_correct || 0;
      const totalTime = p?.total_time_seconds || 0;
      setStats({
        tests: testRes.data?.length || 0,
        questions: totalQ,
        studyHours: Math.round(totalTime / 3600),
        accuracy: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0,
      });
    } catch {
      // Ignore errors for fetching optional stats
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          class: profile.class,
          target_exam: profile.target_exam,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      const examMap: Record<string, 'jee' | 'neet' | 'cuet'> = {
        'JEE Main': 'jee', 'JEE Advanced': 'jee', 'Both': 'jee',
        'NEET': 'neet', 'CUET': 'cuet',
      };
      setExamMode(examMap[profile.target_exam] || 'jee');
      toast.success('Profile updated! 🎉');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const classOptions = [
    { value: '11', label: 'Class 11', emoji: '📘' },
    { value: '12', label: 'Class 12', emoji: '📗' },
    { value: 'dropper', label: 'Dropper', emoji: '🔁' },
  ];

  const examOptions = [
    { value: 'JEE Main', label: 'JEE Main', emoji: '⚡' },
    { value: 'JEE Advanced', label: 'JEE Advanced', emoji: '🚀' },
    { value: 'Both', label: 'JEE Main + Advanced', emoji: '💪' },
    { value: 'NEET', label: 'NEET UG', emoji: '🧬' },
    { value: 'CUET', label: 'CUET', emoji: '🎯' },
  ];

  const statCards = [
    { label: 'Tests Taken', value: stats.tests, icon: Trophy, color: 'from-amber-500 to-orange-600' },
    { label: 'Questions', value: stats.questions, icon: CheckCircle2, color: 'from-emerald-500 to-green-600' },
    { label: 'Study Hours', value: `${stats.studyHours}h`, icon: Clock, color: 'from-blue-500 to-indigo-600' },
    { label: 'Accuracy', value: `${stats.accuracy}%`, icon: Target, color: 'from-purple-500 to-violet-600' },
  ];

  if (loading) {
    return (
      <MainLayout title="Profile">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Profile">
      <div className="max-w-3xl mx-auto space-y-6 pb-10">

        {/* ═══ Hero Card with Avatar ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--prepentrance-navy))] via-[hsl(var(--prepentrance-navy-light))] to-[hsl(var(--accent)/0.8)] p-8"
        >
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 overflow-hidden shadow-2xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/20 text-white text-3xl font-bold">
                    {profile.full_name ? getInitials(profile.full_name) : <User className="w-12 h-12" />}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {profile.full_name || 'Student'}
              </h1>
              <p className="text-white/60 text-sm mt-1">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {profile.class && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {classOptions.find(c => c.value === profile.class)?.label || profile.class}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold border border-accent/20">
                  <Target className="w-3.5 h-3.5" />
                  {profile.target_exam}
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Picker */}
          {showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative mt-6 pt-6 border-t border-white/10"
            >
              <p className="text-white/70 text-sm font-medium mb-3">Choose your avatar:</p>
              <div className="grid grid-cols-6 sm:grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => {
                      setProfile({ ...profile, avatar_url: av.url });
                      setShowAvatarPicker(false);
                    }}
                    className={cn(
                      'w-full aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-lg',
                      profile.avatar_url === av.url
                        ? 'border-accent shadow-accent/30 shadow-lg ring-2 ring-accent/50'
                        : 'border-white/20 hover:border-white/40'
                    )}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover bg-white/10" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ═══ Journey Stats ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', stat.color)} />
                <CardContent className="p-4 text-center">
                  <stat.icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ═══ Personal Information ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="h-11 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="pl-10 h-11 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="pl-10 h-11 bg-muted/30 border-0 text-muted-foreground"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Verified email — cannot be changed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Academic Details ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Academic Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Class</Label>
                  <Select
                    value={profile.class}
                    onValueChange={(value) => setProfile({ ...profile, class: value })}
                  >
                    <SelectTrigger className="h-11 bg-muted/50 border-0 focus:ring-2 focus:ring-accent/50">
                      <SelectValue placeholder="Select your class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.emoji} {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Exam</Label>
                  <Select
                    value={profile.target_exam}
                    onValueChange={(value) => setProfile({ ...profile, target_exam: value })}
                  >
                    <SelectTrigger className="h-11 bg-muted/50 border-0 focus:ring-2 focus:ring-accent/50">
                      <SelectValue placeholder="Select target exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {examOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.emoji} {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Save Button ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <Button onClick={handleSave} disabled={saving} size="lg" className="px-8 shadow-lg">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </motion.div>

        {/* ═══ Mentor Tip ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-accent/5 border border-accent/20 p-5"
        >
          <p className="font-semibold text-foreground mb-1 flex items-center gap-2">
            <span className="text-lg">💡</span> PrepEntrance Mentor's Advice
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Beta, apna profile complete rakho. Isse hum tumhare liye better personalized
            study plan bana sakte hain. Class aur target exam zaroor select karo!
          </p>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
