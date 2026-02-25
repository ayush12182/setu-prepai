import React from 'react';
import { BookOpen, Loader2, RefreshCw, Download, Sparkles, Brain, Target, AlertTriangle, Lightbulb, Zap, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';

interface NotesSectionProps {
  notes: string;
  isLoading: boolean;
  error: string | null;
  subchapterName: string;
  chapterName: string;
  subject: string;
  onGenerate: () => void;
}

const sectionMeta: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  'Concept Starter': { icon: <Lightbulb className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'Core Concept': { icon: <Brain className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'Key Formulas': { icon: <Target className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'Why Students Get Confused': { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  'Exam Insight': { icon: <Target className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'Quick Concept Check': { icon: <HelpCircle className="w-5 h-5" />, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  '30-Second Revision': { icon: <Zap className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
};

function matchSectionMeta(title: string) {
  const clean = title.replace(/[💡🧠📐⚠️🎯✅⚡]/g, '').trim();
  for (const key of Object.keys(sectionMeta)) {
    if (clean.toLowerCase().includes(key.toLowerCase())) return sectionMeta[key];
  }
  return { icon: <BookOpen className="w-5 h-5" />, color: 'text-setu-saffron', bg: 'bg-setu-saffron/10', border: 'border-setu-saffron/20' };
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  isLoading,
  error,
  subchapterName,
  chapterName,
  subject,
  onGenerate,
}) => {
  const downloadPDF = () => {
    if (!notes) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SETU - Interactive Learning Notes', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    doc.setFontSize(14);
    doc.text(subchapterName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${chapterName} • ${subject.charAt(0).toUpperCase() + subject.slice(1)}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const lines = notes.split('\n');
    for (const line of lines) {
      if (yPosition > pageHeight - 30) { doc.addPage(); yPosition = margin; }
      if (line.startsWith('## ')) {
        yPosition += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(line.replace('## ', '').replace(/[💡🧠📐⚠️🎯✅⚡]/g, '').trim(), margin, yPosition);
        yPosition += lineHeight + 3;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      } else if (line.trim()) {
        const textLines = doc.splitTextToSize(line, pageWidth - 2 * margin);
        for (const textLine of textLines) {
          if (yPosition > pageHeight - 30) { doc.addPage(); yPosition = margin; }
          doc.text(textLine, margin, yPosition);
          yPosition += lineHeight;
        }
      } else {
        yPosition += 3;
      }
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text('SETU - Interactive Learning Notes', pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    doc.save(`${subchapterName.replace(/\s+/g, '-')}-notes.pdf`);
  };

  const renderLine = (line: string, lineIndex: number) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Reflective questions / interactive prompts
    if (
      trimmed.startsWith('"') ||
      trimmed.toLowerCase().startsWith('pause') ||
      trimmed.toLowerCase().startsWith('stop') ||
      trimmed.toLowerCase().startsWith('think:') ||
      trimmed.toLowerCase().startsWith('try answering') ||
      trimmed.toLowerCase().includes('before reading')
    ) {
      return (
        <div key={lineIndex} className="my-3 p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sm italic text-sky-700 dark:text-sky-300 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{trimmed}</span>
        </div>
      );
    }

    // Question lines (Q1, Q2, Q3)
    if (/^Q\d+[:.]/.test(trimmed)) {
      return (
        <div key={lineIndex} className="my-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm font-medium text-foreground flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <span>{trimmed}</span>
        </div>
      );
    }

    // Formula lines (→ arrows)
    if (trimmed.startsWith('→')) {
      return (
        <p key={lineIndex} className="pl-4 mb-1 text-sm text-muted-foreground flex items-start gap-1.5">
          <span className="text-setu-saffron">→</span>
          <span>{trimmed.slice(1).trim()}</span>
        </p>
      );
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      return (
        <p key={lineIndex} className="flex items-start gap-2 mb-1.5 text-sm text-foreground/90">
          <span className="text-setu-saffron mt-0.5">•</span>
          <span>{trimmed.replace(/^[-•]\s*/, '')}</span>
        </p>
      );
    }

    // Warning/trap lines
    if (trimmed.startsWith('⚠') || trimmed.toLowerCase().startsWith('watch out') || trimmed.toLowerCase().startsWith('trap:')) {
      return (
        <p key={lineIndex} className="mb-1.5 text-sm text-red-500 dark:text-red-400 font-medium">
          {trimmed}
        </p>
      );
    }

    // Bold-like lines (formula names etc.)
    if (trimmed.includes(':') && trimmed.indexOf(':') < 30 && !trimmed.startsWith('http')) {
      const colonIdx = trimmed.indexOf(':');
      const label = trimmed.slice(0, colonIdx);
      const value = trimmed.slice(colonIdx + 1).trim();
      if (label.length < 30 && value) {
        return (
          <p key={lineIndex} className="mb-1.5 text-sm">
            <span className="font-semibold text-foreground">{label}:</span>{' '}
            <span className="text-foreground/85">{value}</span>
          </p>
        );
      }
    }

    return <p key={lineIndex} className="mb-2 text-sm text-foreground/90 leading-relaxed">{trimmed}</p>;
  };

  const renderFormattedNotes = () => {
    if (!notes) return null;
    const sections = notes.split(/(?=## )/);

    return sections.map((section, index) => {
      if (!section.trim()) return null;
      const lines = section.split('\n');
      const rawTitle = lines[0]?.replace('## ', '').trim();
      const content = lines.slice(1);
      if (!rawTitle) return null;

      const meta = matchSectionMeta(rawTitle);

      return (
        <div key={index} className={`mb-6 rounded-xl border ${meta.border} overflow-hidden`}>
          {/* Section header */}
          <div className={`${meta.bg} px-5 py-3 flex items-center gap-3`}>
            <div className={meta.color}>{meta.icon}</div>
            <h3 className="text-base font-semibold text-foreground">
              {rawTitle.replace(/[💡🧠📐⚠️🎯✅⚡]/g, '').trim()}
            </h3>
          </div>
          {/* Section body */}
          <div className="px-5 py-4 space-y-0.5">
            {content.map((line, lineIndex) => renderLine(line, lineIndex))}
          </div>
        </div>
      );
    });
  };

  // Empty state
  if (!notes && !isLoading && !error) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-setu-saffron/10 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-setu-saffron" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Generate Interactive Learning Notes
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Step-by-step teaching notes with concept starters, interactive checks, common mistakes, and 30-second revision — like Jeetu Bhaiya teaching you personally.
        </p>
        <Button onClick={onGenerate} className="bg-gradient-to-r from-setu-saffron to-setu-saffron/80 text-white">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Notes
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-setu-saffron" />
          <span className="text-foreground font-medium">Generating interactive notes...</span>
        </div>
        {notes && (
          <div className="max-h-[500px] overflow-y-auto">
            {renderFormattedNotes()}
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card border border-destructive/30 rounded-xl p-8 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={onGenerate} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Notes rendered
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-setu-saffron/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-setu-saffron" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Interactive Learning Notes</h3>
            <p className="text-xs text-muted-foreground">Step-by-step exam preparation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onGenerate}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Regenerate
          </Button>
          <Button size="sm" onClick={downloadPDF} className="bg-gradient-to-r from-setu-green to-setu-green/80 text-white">
            <Download className="w-4 h-4 mr-1" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Notes content */}
      <div className="max-h-[700px] overflow-y-auto pr-1">
        {renderFormattedNotes()}
      </div>

      {/* Mentor signature */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center italic">
          "Ye notes exam se pehle raat ko ek baar zaroor padhna." — Jeetu Bhaiya
        </p>
      </div>
    </div>
  );
};
