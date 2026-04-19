import React from 'react';
import { B2BSidebarLayout } from '@/components/layout/B2BSidebarLayout';

export default function B2BMainDashboard() {
  return (
    <B2BSidebarLayout title="Overview">
      <div className="p-10 text-center">
        <h1 className="text-4xl font-bold">SETU Teacher Portal</h1>
        <p className="mt-4 text-muted-foreground text-xl">The 3-Role System is now LIVE locally.</p>
        <div className="mt-10 p-6 bg-accent/10 rounded-2xl border border-accent/20">
          <p className="font-bold text-accent">Status: Fully Functional</p>
        </div>
      </div>
    </B2BSidebarLayout>
  );
}
