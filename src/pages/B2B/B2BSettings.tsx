import React from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';
import { Settings, Building2 } from 'lucide-react';

export default function B2BSettings() {
  return (
    <B2BSidebarLayout title="Settings">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage organization and billing.</p>
        </div>
        
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
           <h2 className="text-lg font-bold flex items-center gap-2"><Building2 size={18} /> Organization Profile</h2>
           <div>
             <label className="text-xs uppercase font-bold text-muted-foreground block mb-1">Organization Name</label>
             <input type="text" className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2" defaultValue="Newton Academy" />
           </div>
           <div>
             <label className="text-xs uppercase font-bold text-muted-foreground block mb-1">City</label>
             <input type="text" className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2" defaultValue="Kota" />
           </div>
           <button className="bg-accent text-white px-6 py-2 rounded-xl font-bold mt-2">Save Changes</button>
        </div>
      </div>
    </B2BSidebarLayout>
  );
}
