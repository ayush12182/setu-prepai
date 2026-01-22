import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TrendingUp, Target, Clock, AlertTriangle } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <MainLayout title="Analytics">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Your Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your progress and identify weak areas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <TrendingUp className="w-8 h-8 text-setu-success mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">68%</p>
            <p className="text-sm text-muted-foreground">Overall Score</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <Target className="w-8 h-8 text-physics mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">342</p>
            <p className="text-sm text-muted-foreground">Questions Done</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <Clock className="w-8 h-8 text-setu-saffron mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">24h</p>
            <p className="text-sm text-muted-foreground">Study Time</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <AlertTriangle className="w-8 h-8 text-setu-warning mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">5</p>
            <p className="text-sm text-muted-foreground">Weak Chapters</p>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Subject-wise Performance</h3>
          <div className="space-y-4">
            {[
              { name: 'Physics', score: 72, color: 'bg-physics' },
              { name: 'Chemistry', score: 65, color: 'bg-chemistry' },
              { name: 'Mathematics', score: 58, color: 'bg-maths' }
            ].map((subject) => (
              <div key={subject.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{subject.name}</span>
                  <span className="text-sm text-muted-foreground">{subject.score}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${subject.color} rounded-full transition-all duration-500`}
                    style={{ width: `${subject.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="bg-setu-warning/10 border border-setu-warning/30 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-setu-warning" />
            Focus Areas
          </h3>
          <ul className="space-y-2">
            <li className="text-sm">• Rotational Motion - 45% accuracy</li>
            <li className="text-sm">• Organic Reactions - 52% accuracy</li>
            <li className="text-sm">• Integration - 48% accuracy</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
