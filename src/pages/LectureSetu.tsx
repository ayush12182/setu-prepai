import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, FileText, Clock, Bookmark, Sparkles, ArrowRight } from 'lucide-react';

const LectureSetu: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = () => {
    if (!videoUrl) return;
    setIsProcessing(true);
    // Processing would happen here
    setTimeout(() => setIsProcessing(false), 3000);
  };

  const features = [
    { icon: FileText, title: 'Structured Notes', desc: 'AI converts lecture to exam-focused notes' },
    { icon: Clock, title: 'Key Timestamps', desc: 'Important moments highlighted' },
    { icon: Bookmark, title: 'Flashcards', desc: 'Auto-generated revision cards' },
  ];

  return (
    <MainLayout title="Lecture SETU">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-setu-saffron/10 text-setu-saffron px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            New Feature
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Lecture SETU
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Paste any YouTube lecture link and get structured notes, timestamps, formulas, and flashcards instantly.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Paste Lecture Link</h3>
              <p className="text-sm text-muted-foreground">YouTube, Google Drive, or any video URL</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1"
            />
            <Button 
              onClick={handleProcess}
              disabled={!videoUrl || isProcessing}
              className="btn-hero gap-2"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  Process
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="bg-card border border-border rounded-xl p-5 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* What You Get */}
        <div className="bg-gradient-to-br from-primary to-setu-navy-light rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">What You Get</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-setu-saffron">✓</span>
              <span>Structured notes with key concepts highlighted</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-setu-saffron">✓</span>
              <span>Important timestamps for quick revision</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-setu-saffron">✓</span>
              <span>All formulas extracted in one place</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-setu-saffron">✓</span>
              <span>PYQ connections - which questions relate to this topic</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-setu-saffron">✓</span>
              <span>1-page revision summary</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-setu-saffron">✓</span>
              <span>Auto-generated flashcards for spaced repetition</span>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default LectureSetu;
