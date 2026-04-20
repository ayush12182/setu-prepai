import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Target, BookOpen, TrendingUp } from 'lucide-react';
import { ChapterAnalysis } from '@/hooks/useMajorTest';

interface MajorTestMentorMessageProps {
  score: number;
  maxScore: number;
  percentile: number;
  weakChapters: ChapterAnalysis[];
  strongChapters: ChapterAnalysis[];
  onContinue: () => void;
}

const MajorTestMentorMessage: React.FC<MajorTestMentorMessageProps> = ({
  score,
  maxScore,
  percentile,
  weakChapters,
  strongChapters,
  onContinue
}) => {
  // Generate personalized message based on performance
  const getMessage = () => {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 80) {
      return {
        opening: "Bahut accha! Tum sahi track pe ho.",
        main: "Is test ne prove kar diya ki tumhare fundamentals strong hain. Lekin JEE mein complacency sabse bada dushman hai. Ab focus karo weak areas pe aur practice badhao.",
        closing: "Next 21 days mein aur mazboot hona hai. Thoda aur push karo."
      };
    } else if (percentage >= 60) {
      return {
        opening: "Theek hai. Honest performance dikha hai tumne.",
        main: "Is test ne bata diya tum kahan khade ho. Kuch chapters strong hain, kuch mein mehnat chahiye. Panic mat karo - direction mil gayi hai.",
        closing: "Ab clarity ke saath aage badho. Ek chapter at a time."
      };
    } else if (percentage >= 40) {
      return {
        opening: "Sun, ye score dekh ke discourage mat ho.",
        main: "Is test ne expose kiya tumhari gaps. Aur ye acchi baat hai - kyunki ab pata hai kahan kaam karna hai. Bahut log ye bhi nahi jaante.",
        closing: "Ab foundation pe focus karo. Basics strong karo, marks automatically badhenge."
      };
    } else {
      return {
        opening: "Dekho, score important hai but zyada important hai ki tum yahan ho.",
        main: "Bahut log ye test lene ki himmat nahi rakhte. Tumne liya, honestly attempt kiya. Is test ne bataya hai ki kahan se shuru karna hai.",
        closing: "Rote mat raho score pe. Ab serious study shuru karo. Step by step."
      };
    }
  };

  const message = getMessage();
  const top5Weak = weakChapters.slice(0, 5);
  const top3Strong = strongChapters.slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        {/* Mentor Message Card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-1">
                Jeetu Bhaiya
              </h2>
              <p className="text-sm text-muted-foreground">Your JEE Mentor</p>
            </div>
          </div>

          <div className="space-y-4 text-lg text-foreground leading-relaxed">
            <p className="font-medium text-primary">{message.opening}</p>
            <p>{message.main}</p>
            <p className="italic">{message.closing}</p>
          </div>
        </div>

        {/* 21-Day Focus Plan */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Next 21-Day Focus Plan
          </h3>

          {/* Weak Chapters to Improve */}
          {top5Weak.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top 5 Chapters to Improve
              </h4>
              <div className="space-y-2">
                {top5Weak.map((chapter, index) => (
                  <div 
                    key={chapter.chapterId}
                    className="flex items-center gap-3 p-3 bg-red-50 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-sm font-bold text-red-700">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-red-800">{chapter.chapterName}</span>
                      <span className="text-sm text-red-600 ml-2 capitalize">({chapter.subject})</span>
                    </div>
                    <span className="text-sm text-red-600">{chapter.accuracy.toFixed(0)}% accuracy</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strong Chapters to Maintain */}
          {top3Strong.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Chapters to Maintain
              </h4>
              <div className="flex flex-wrap gap-2">
                {top3Strong.map(chapter => (
                  <div 
                    key={chapter.chapterId}
                    className="px-3 py-2 bg-green-50 rounded-lg text-sm text-green-700"
                  >
                    {chapter.chapterName} ✓
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Motivational Quote */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
          <p className="text-lg text-foreground italic mb-2">
            "Exam hall mein wohi zinda bachta hai jo apni weaknesses jaanta hai."
          </p>
          <p className="text-sm text-primary font-medium">— Jeetu Bhaiya</p>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={onContinue}
          className="w-full bg-primary text-primary-foreground h-12 text-lg"
        >
          Start Next 21-Day Cycle
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default MajorTestMentorMessage;
