import React from 'react';
import { BookOpen, Loader2, RefreshCw, Download, Sparkles } from 'lucide-react';
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

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SETU - Kota Style Notes', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Subchapter info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(subchapterName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${chapterName} • ${subject.charAt(0).toUpperCase() + subject.slice(1)}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Line separator
    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Process notes content
    doc.setFontSize(10);
    const lines = notes.split('\n');

    for (const line of lines) {
      // Check for page break
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }

      if (line.startsWith('## ')) {
        // Section header
        yPosition += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(line.replace('## ', ''), margin, yPosition);
        yPosition += lineHeight + 3;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      } else if (line.trim()) {
        // Regular text - wrap long lines
        const textLines = doc.splitTextToSize(line, pageWidth - 2 * margin);
        for (const textLine of textLines) {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(textLine, margin, yPosition);
          yPosition += lineHeight;
        }
      } else {
        yPosition += 3; // Empty line spacing
      }
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        'SETU - Ab JEE Easy Hai | Kota Style Notes',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    // Download
    const fileName = `${subchapterName.replace(/\s+/g, '-')}-notes.pdf`;
    doc.save(fileName);
  };

  // Parse notes into sections for styled display
  const renderFormattedNotes = () => {
    if (!notes) return null;

    const sections = notes.split(/(?=## )/);
    
    return sections.map((section, index) => {
      if (!section.trim()) return null;

      const lines = section.split('\n');
      const title = lines[0]?.replace('## ', '').trim();
      const content = lines.slice(1).join('\n').trim();

      if (!title) return null;

      return (
        <div key={index} className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-setu-saffron"></span>
            {title}
          </h3>
          <div className="pl-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {content.split('\n').map((line, lineIndex) => {
              if (line.startsWith('- ') || line.startsWith('• ')) {
                return (
                  <p key={lineIndex} className="flex items-start gap-2 mb-1">
                    <span className="text-setu-saffron mt-1">•</span>
                    <span>{line.replace(/^[-•]\s*/, '')}</span>
                  </p>
                );
              }
              if (line.trim()) {
                return <p key={lineIndex} className="mb-2">{line}</p>;
              }
              return null;
            })}
          </div>
        </div>
      );
    });
  };

  if (!notes && !isLoading && !error) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-setu-saffron/10 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-setu-saffron" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Generate Jeetu Bhaiya's Notes
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Kota-style exam notes with theory, formulas, mistakes, and PYQ focus - 
          written like Jeetu Bhaiya is teaching you personally.
        </p>
        <Button 
          onClick={onGenerate}
          className="bg-gradient-to-r from-setu-saffron to-setu-saffron/80 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Notes
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-setu-saffron" />
          <span className="text-foreground font-medium">Jeetu Bhaiya notes likh rahe hain...</span>
        </div>
        {notes && (
          <div className="bg-muted/30 rounded-lg p-6 max-h-[500px] overflow-y-auto">
            {renderFormattedNotes()}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-setu-error/30 rounded-xl p-8 text-center">
        <p className="text-setu-error mb-4">{error}</p>
        <Button onClick={onGenerate} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-setu-saffron/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-setu-saffron" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Jeetu Bhaiya's Notes</h3>
            <p className="text-xs text-muted-foreground">Kota-style exam preparation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onGenerate}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Regenerate
          </Button>
          <Button 
            size="sm" 
            onClick={downloadPDF}
            className="bg-gradient-to-r from-setu-green to-setu-green/80 text-white"
          >
            <Download className="w-4 h-4 mr-1" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Notes content */}
      <div className="bg-muted/20 rounded-lg p-6 max-h-[600px] overflow-y-auto">
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
