import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Clock, Target, TrendingUp, Zap } from 'lucide-react';

const TestPage: React.FC = () => {
  const testTypes = [
    {
      title: 'Chapter Test',
      description: 'Test your understanding of a single chapter',
      icon: Target,
      time: '30-60 min',
      questions: '20-30'
    },
    {
      title: 'Mixed Test',
      description: 'Combine multiple chapters for comprehensive revision',
      icon: TrendingUp,
      time: '60-90 min',
      questions: '40-60'
    },
    {
      title: 'PYQ Test',
      description: 'Practice with previous year questions only',
      icon: Clock,
      time: '45 min',
      questions: '25'
    },
    {
      title: 'Adaptive Test',
      description: 'AI selects questions based on your weak areas',
      icon: Zap,
      time: 'Varies',
      questions: 'Personalized'
    }
  ];

  return (
    <MainLayout title="Test">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Take a Test
          </h1>
          <p className="text-muted-foreground">
            Challenge yourself with timed tests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testTypes.map((test, i) => (
            <div 
              key={i}
              className="bg-card border border-border rounded-xl p-6 card-hover"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <test.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{test.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{test.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                    <span>⏱ {test.time}</span>
                    <span>📝 {test.questions} questions</span>
                  </div>
                  <Button className="w-full">Start Test</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default TestPage;
