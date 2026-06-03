import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { TrialStatusBar } from '../trial/TrialStatusBar';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  fullHeight?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title, fullHeight }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <TrialStatusBar />
        
        <main className={cn("flex-1", fullHeight ? "overflow-hidden" : "overflow-auto")}>
          {fullHeight ? (
            <div className="h-full">{children}</div>
          ) : (
            <div className="container py-6 px-4 lg:px-6">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
};
