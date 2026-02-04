import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Upload, Camera, Loader2, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface HandwrittenNotesAnalysisProps {
  onBack: () => void;
}

type SubjectType = 'physics' | 'chemistry' | 'maths' | '';

const HandwrittenNotesAnalysis: React.FC<HandwrittenNotesAnalysisProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState<SubjectType>('');
  const [topic, setTopic] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setAnalysis('');
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-handwritten-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          subject: subject || undefined,
          topic: topic || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze notes');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAnalysis = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullAnalysis += content;
                setAnalysis(fullAnalysis);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      toast.success('Notes analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing notes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze notes');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setAnalysis('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const renderAnalysis = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('📝') || line.startsWith('✅') || line.startsWith('❌') || line.startsWith('💡') || line.startsWith('🎯')) {
        return <h3 key={i} className="text-lg font-semibold mt-6 mb-3 text-primary">{line}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <p key={i} className="ml-4 my-1">• {line.slice(2)}</p>;
      }
      if (line.startsWith('Acha beta') || line.startsWith('Bas beta')) {
        return <p key={i} className="my-3 text-setu-saffron font-medium italic">{line}</p>;
      }
      if (line.trim()) {
        return <p key={i} className="my-2">{line}</p>;
      }
      return <br key={i} />;
    });
  };

  const subjectColors: Record<SubjectType, string> = {
    physics: 'bg-physics/10 text-physics border-physics',
    chemistry: 'bg-chemistry/10 text-chemistry border-chemistry',
    maths: 'bg-maths/10 text-maths border-maths',
    '': 'bg-muted text-muted-foreground border-border'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Handwritten Notes Analysis</h2>
          <p className="text-sm text-muted-foreground">Upload your notes and get Kota-style teaching</p>
        </div>
      </div>

      {/* Upload Section */}
      {!analysis && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          {/* Image Preview or Upload Area */}
          {selectedImage ? (
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Uploaded notes" 
                className="w-full max-h-[400px] object-contain rounded-lg border border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Upload your handwritten notes</p>
              <p className="text-sm text-muted-foreground mb-4">
                Click to browse or drag and drop
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
                <Button variant="outline" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Optional Subject & Topic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject (Optional)</label>
              <div className="flex gap-2">
                {(['physics', 'chemistry', 'maths'] as SubjectType[]).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSubject(subject === sub ? '' : sub)}
                    className={cn(
                      'px-4 py-2 rounded-lg border capitalize transition-all',
                      subject === sub ? subjectColors[sub] : 'bg-background hover:bg-muted'
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Topic (Optional)</label>
              <Input
                placeholder="e.g., Kinematics, Organic Chemistry..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>

          {/* Analyze Button */}
          <Button 
            className="w-full" 
            size="lg"
            disabled={!selectedImage || isAnalyzing}
            onClick={handleAnalyze}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Jeetu Bhaiya is reading your notes...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Notes with AI
              </>
            )}
          </Button>
        </div>
      )}

      {/* Analysis Results */}
      {(analysis || isAnalyzing) && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-setu-saffron" />
              Jeetu Bhaiya's Analysis
            </h3>
            {!isAnalyzing && (
              <Button variant="outline" size="sm" onClick={clearImage}>
                Analyze Another
              </Button>
            )}
          </div>

          {/* Show uploaded image thumbnail */}
          {selectedImage && (
            <div className="mb-4">
              <img 
                src={selectedImage} 
                alt="Analyzed notes" 
                className="w-32 h-32 object-cover rounded-lg border border-border"
              />
            </div>
          )}

          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isAnalyzing && !analysis ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Reading your handwriting...</span>
              </div>
            ) : (
              <>
                {renderAnalysis(analysis)}
                {isAnalyzing && (
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      {!analysis && !isAnalyzing && (
        <div className="mentor-tip">
          <p className="font-medium text-foreground mb-1">💡 Tips for best results</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Make sure your handwriting is clearly visible</li>
            <li>• Good lighting helps AI read better</li>
            <li>• You can take a photo of a single page or topic</li>
            <li>• Selecting subject helps AI give more relevant tips</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HandwrittenNotesAnalysis;
