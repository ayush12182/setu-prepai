import React, { useState, useEffect } from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Settings, Building2, User, Target, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function B2BSettings() {
  const { profile, user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [city, setCity] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetExam, setTargetExam] = useState('');

  // Load real data from profile on mount
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setTargetExam(profile.target_exam || 'JEE Main');
      setOrgName(profile.institution_name || '');
    }
  }, [profile]);

  // Load organization name if we have an org_id
  useEffect(() => {
    const fetchOrg = async () => {
      const orgId = (profile as any)?.organization_id;
      if (!orgId) return;
      const { data } = await (supabase as any).from('organizations').select('name, city').eq('id', orgId).maybeSingle();
      if (data) {
        setOrgName((data as any).name || '');
        setCity((data as any).city || '');
      }
    };
    fetchOrg();
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update profile fields
      await updateProfile({
        full_name: fullName,
        target_exam: targetExam,
        institution_name: orgName,
      } as any);

      // Update organization row if it exists
      const orgId = (profile as any)?.organization_id;
      if (orgId) {
        await (supabase as any)
          .from('organizations')
          .update({ name: orgName, city })
          .eq('id', orgId);
      }

      toast.success('Settings saved!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings');
    }
    setSaving(false);
  };

  const EXAM_OPTIONS = ['JEE Main', 'JEE Advanced', 'NEET', 'CUET', 'CA Foundation'];

  return (
    <B2BSidebarLayout title="Settings">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your profile and organization details.</p>
        </div>

        {/* Personal Profile */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><User size={18} /> Your Profile</h2>
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground block mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground block mb-1">Email</label>
            <input
              type="text"
              value={user?.email || ''}
              disabled
              className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>

        {/* Teaching Preferences */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Target size={18} /> Teaching Preferences</h2>
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground block mb-1">Primary Exam Focus</label>
            <select
              value={targetExam}
              onChange={e => setTargetExam(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            >
              {EXAM_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {/* Organization */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Building2 size={18} /> Organization Profile</h2>
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground block mb-1">Organization / Institute Name</label>
            <input
              type="text"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="e.g. Allen Career Institute"
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-muted-foreground block mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. Kota, Delhi, Mumbai"
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-black font-bold px-8 py-3 rounded-xl h-12 w-full"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</>
          ) : saved ? (
            <><CheckCircle2 size={16} className="mr-2" /> Saved!</>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </B2BSidebarLayout>
  );
}
