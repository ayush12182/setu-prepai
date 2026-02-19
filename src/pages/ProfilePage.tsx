import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, User, BookOpen, Target, Phone, Save, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileData {
  full_name: string;
  phone: string;
  class: string;
  target_exam: string;
  avatar_url: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { setExamMode } = useExamMode();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    }
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

      // Update local exam mode immediately
      const isNeet = profile.target_exam === 'NEET';
      setExamMode(isNeet ? 'neet' : 'jee');

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const classOptions = [
    { value: '11', label: 'Class 11' },
    { value: '12', label: 'Class 12' },
    { value: 'dropper', label: 'Dropper' },
  ];

  const examOptions = [
    { value: 'JEE Main', label: 'JEE Main' },
    { value: 'JEE Advanced', label: 'JEE Advanced' },
    { value: 'Both', label: 'JEE Main + Advanced' },
    { value: 'NEET', label: 'NEET UG' },
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Your Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Picture</CardTitle>
            <CardDescription>Your avatar will be displayed across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.full_name ? getInitials(profile.full_name) : <User className="w-10 h-10" />}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Input
                  placeholder="Enter avatar URL"
                  value={profile.avatar_url}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Paste an image URL for your profile picture
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </CardContent>
        </Card>

        {/* Academic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Academic Details
            </CardTitle>
            <CardDescription>Help us personalize your learning experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Current Class</Label>
                <Select
                  value={profile.class}
                  onValueChange={(value) => setProfile({ ...profile, class: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam">Target Exam</Label>
                <Select
                  value={profile.target_exam}
                  onValueChange={(value) => setProfile({ ...profile, target_exam: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {examOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Stats Preview */}
        <Card className="bg-gradient-to-br from-primary to-setu-navy-light text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-setu-saffron" />
              Your Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-setu-saffron">0</p>
                <p className="text-sm text-white/70">Tests Taken</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-setu-saffron">0</p>
                <p className="text-sm text-white/70">Questions Solved</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-setu-saffron">0h</p>
                <p className="text-sm text-white/70">Study Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
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
        </div>

        {/* Mentor Tip */}
        <div className="mentor-tip">
          <p className="font-medium text-foreground mb-1">💡 Jeetu Bhaiya's Advice</p>
          <p className="text-muted-foreground text-sm">
            Beta, apna profile complete rakho. Isse hum tumhare liye better personalized
            study plan bana sakte hain. Class aur target exam zaroor select karo!
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
