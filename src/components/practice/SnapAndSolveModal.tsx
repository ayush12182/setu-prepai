import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Sparkles, ScanLine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processSnapWithClaude, ParsedQuestionResult } from '@/lib/visionEngine';
import { AISolutionCard } from './AISolutionCard';

interface SnapAndSolveModalProps {
  onClose: () => void;
}

export const SnapAndSolveModal: React.FC<SnapAndSolveModalProps> = ({ onClose }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'reading' | 'solving' | 'done'>('idle');
  const [result, setResult] = useState<ParsedQuestionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!imagePreview) return;
    setStatus('reading');
    setError(null);
    
    // Simulate UI shift from Reading -> Solving halfway through the mock API call
    const readingTimer = setTimeout(() => {
        setStatus('solving');
    }, 1500);

    try {
       const extractedData = await processSnapWithClaude(imagePreview);
       setResult(extractedData);
       setStatus('done');
    } catch (err: any) {
       setError(err.message || 'Something went wrong. Please try again.');
       setStatus('idle');
    } finally {
       clearTimeout(readingTimer);
    }
  };

  if (status === 'done' && result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in">
         <AISolutionCard data={result} onClose={onClose} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
       <div className="bg-card w-full max-w-lg rounded-3xl border border-border overflow-hidden shadow-2xl relative">
          
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Snap & Solve
            </h2>
            <button onClick={onClose} disabled={status === 'reading' || status === 'solving'} className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors disabled:opacity-50">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {!imagePreview ? (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center mb-6">Capture or upload any handwritten question, printed textbook page, or worksheet. PrepEntrance Vision will parse and solve it instantly.</p>
                
                {/* Hidden Inputs */}
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileSelect} />
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="h-24 flex flex-col gap-2 rounded-2xl bg-secondary border border-border text-foreground hover:border-accent hover:text-accent shadow-sm"
                    variant="outline"
                  >
                    <Camera className="w-6 h-6" /> Take Photo
                  </Button>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 flex flex-col gap-2 rounded-2xl bg-secondary border border-border text-foreground hover:text-primary shadow-sm"
                    variant="outline"
                  >
                    <ImageIcon className="w-6 h-6" /> Upload Gallery
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                 <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black mb-6 shadow-inner border border-border">
                    <img src={imagePreview} alt="Question Preview" className="w-full h-full object-contain opacity-80" />
                    
                    {/* Scanning Overlay Animation */}
                    <AnimatePresence>
                      {(status === 'reading' || status === 'solving') && (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-accent/10 flex flex-col items-center justify-center backdrop-blur-[2px]"
                        >
                           <motion.div 
                             animate={{ top: ['0%', '100%', '0%'] }} 
                             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                             className="absolute w-full h-1 bg-accent shadow-[0_0_15px_rgba(var(--accent),1)]"
                           />
                           <ScanLine className="w-12 h-12 text-accent animate-pulse drop-shadow-[0_0_10px_rgba(var(--accent),0.5)]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
                 
                 {error && (
                   <div className="w-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl mb-4 text-center font-medium">
                     {error}
                   </div>
                 )}

                 {status === 'idle' ? (
                   <div className="flex gap-4 w-full">
                     <Button variant="outline" onClick={() => setImagePreview(null)} className="flex-1 h-12 rounded-xl text-muted-foreground border-border">
                       Retake
                     </Button>
                     <Button onClick={handleSolve} className="flex-[2] h-12 rounded-xl bg-accent text-primary font-bold shadow-[0_4px_14px_rgba(var(--accent),0.3)] hover:shadow-[0_6px_20px_rgba(var(--accent),0.4)]">
                       Solve This →
                     </Button>
                   </div>
                 ) : (
                   <div className="w-full h-12 flex items-center justify-center font-bold text-accent tracking-widest uppercase animate-pulse">
                     {status === 'reading' ? 'Reading your question...' : 'Solving step by step...'}
                   </div>
                 )}
              </div>
            )}
          </div>

       </div>
    </div>
  );
};
