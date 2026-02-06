// ChapterPage - Shows subchapters (topics) for a chapter
// Hierarchy: Subject → Chapter → Subchapter → Learn/Practice/Test/Analyze
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { getChapterById } from '@/data/syllabus';
import { getSubchaptersByChapterId } from '@/data/subchapters';
import { AlertTriangle, Zap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// New modular components
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { SubchapterCard } from '@/components/chapter/SubchapterCard';
import { TrendingConcepts } from '@/components/chapter/TrendingConcepts';
import { JeetuTip } from '@/components/chapter/JeetuTip';

const ChapterPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();

  const chapter = chapterId ? getChapterById(chapterId) : null;
  const subchapters = chapterId ? getSubchaptersByChapterId(chapterId) : [];

  if (!chapter) {
    return (
      <MainLayout title="Chapter Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chapter not found</p>
          <Button onClick={() => navigate('/learn')} className="mt-4">
            Back to Learn
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={chapter.name}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Chapter Header with Stats */}
        <ChapterHeader chapter={chapter} subchapterCount={subchapters.length} />

        {/* Jeetu Bhaiya Tip */}
        <JeetuTip chapter={chapter} subchapterCount={subchapters.length} />

        {/* Subchapters Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <BookOpen className="w-5 h-5 text-primary" />
              Pick a Topic to Start
            </h2>
            <span className="text-sm text-muted-foreground">
              {subchapters.length} topics
            </span>
          </div>

          {subchapters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subchapters.map((subchapter, index) => (
                <SubchapterCard
                  key={subchapter.id}
                  subchapter={subchapter}
                  index={index}
                  subject={chapter.subject}
                />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-muted/50 border border-border rounded-2xl p-8 text-center"
            >
              <AlertTriangle className="w-12 h-12 text-setu-warning mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">Topics are being prepared</p>
              <p className="text-sm text-muted-foreground mb-4">
                Our team is adding content for this chapter. Check back soon!
              </p>
              <Button variant="outline" onClick={() => navigate('/learn')}>
                Explore Other Chapters
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Trending Concepts */}
        <TrendingConcepts chapter={chapter} />

        {/* Key Formulas Preview */}
        {chapter.keyFormulas.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Zap className="w-5 h-5 text-setu-warning" />
              Key Formulas (Quick Look)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {chapter.keyFormulas.slice(0, 6).map((formula, i) => (
                <div 
                  key={i} 
                  className="p-3 bg-secondary/50 rounded-xl font-mono text-sm text-foreground border border-border"
                >
                  {formula}
                </div>
              ))}
            </div>
            {chapter.keyFormulas.length > 6 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                + {chapter.keyFormulas.length - 6} more formulas inside topics
              </p>
            )}
          </motion.div>
        )}

        {/* Prerequisites */}
        {chapter.prerequisites.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-secondary/30 border border-border rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-3 text-foreground">Before You Start</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete these chapters first for better understanding:
            </p>
            <div className="flex flex-wrap gap-2">
              {chapter.prerequisites.map((prereq) => {
                const prereqChapter = getChapterById(prereq);
                return prereqChapter ? (
                  <Button
                    key={prereq}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => navigate(`/chapter/${prereq}`)}
                  >
                    {prereqChapter.name}
                  </Button>
                ) : null;
              })}
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default ChapterPage;
