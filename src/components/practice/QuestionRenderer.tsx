import React, { useState } from 'react';
import { Question, QuestionType } from '@/hooks/usePracticeQuestions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JeeQuestion, JeeOption } from '@/lib/jeeMathRenderer';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuestionRendererProps {
  question: Question;
  selectedAnswer: any;
  onAnswerSelect: (answer: any) => void;
  disabled?: boolean;
  showResult?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled = false,
  showResult = false
}) => {
  const [numericalInput, setNumericalInput] = useState(selectedAnswer?.toString() || '');

  const handleNumericalSubmit = () => {
    const val = parseFloat(numericalInput);
    if (!isNaN(val)) {
      onAnswerSelect(val);
    }
  };

  const renderMCQ = () => {
    if (!question.options) return null;
    return (
      <div className="space-y-3">
        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
          const optionText = question.options![opt];
          const isSelected = selectedAnswer === opt;
          const isCorrect = question.answer === opt;

          let optionStyle = 'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-slate-50/50';
          if (isSelected) optionStyle = 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-sm';
          if (showResult) {
            if (isCorrect) optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950';
            else if (isSelected) optionStyle = 'border-red-500 bg-red-50 text-red-950';
            else optionStyle = 'border-slate-200 opacity-50 bg-white text-slate-400';
          }

          return (
            <button
              key={opt}
              onClick={() => !disabled && onAnswerSelect(opt)}
              disabled={disabled}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 group',
                optionStyle,
                !disabled && 'cursor-pointer'
              )}
            >
              <span className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors',
                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
              )}>
                {opt}
              </span>
              <div className="flex-1 pt-0.5 font-medium text-slate-850">
                <JeeOption option={optionText} />
              </div>
              {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />}
              {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  };

  const renderAR = () => {
    // AR is essentially an MCQ with fixed options
    const arOptions = {
      A: "Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).",
      B: "Both Assertion (A) and Reason (R) are true but Reason (R) is not the correct explanation of Assertion (A).",
      C: "Assertion (A) is true but Reason (R) is false.",
      D: "Assertion (A) is false but Reason (R) is true."
    };

    return (
      <div className="space-y-3">
        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = question.answer === opt;

          let optionStyle = 'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-slate-50/50';
          if (isSelected) optionStyle = 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-sm';
          if (showResult) {
            if (isCorrect) optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950';
            else if (isSelected) optionStyle = 'border-red-500 bg-red-50 text-red-950';
            else optionStyle = 'border-slate-200 opacity-50 bg-white text-slate-400';
          }

          return (
            <button
              key={opt}
              onClick={() => !disabled && onAnswerSelect(opt)}
              disabled={disabled}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 group',
                optionStyle,
                !disabled && 'cursor-pointer'
              )}
            >
              <span className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors',
                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
              )}>
                {opt}
              </span>
              <p className="text-sm font-medium pt-1 text-slate-800">{arOptions[opt]}</p>
              {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />}
              {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  };

  const renderNumerical = () => {
    const isCorrect = (val: number) => {
      if (typeof question.answer === 'number') {
        return Math.abs(val - question.answer) < 0.01;
      }
      if (typeof question.answer === 'object' && 'min' in question.answer) {
        return val >= question.answer.min && val <= question.answer.max;
      }
      return val.toString() === question.answer.toString();
    };

    return (
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="relative">
          <Input
            type="number"
            step="any"
            placeholder="Enter your numerical answer"
            value={numericalInput}
            onChange={(e) => setNumericalInput(e.target.value)}
            disabled={disabled}
            className={cn(
              "h-14 text-lg font-bold text-center rounded-xl border-2 transition-all bg-white text-slate-900 border-slate-200 focus:border-blue-500",
              showResult && (isCorrect(parseFloat(numericalInput)) ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-red-500 bg-red-50 text-red-900")
            )}
          />
          {showResult && (
            <div className="mt-3 text-center">
              <p className={cn("text-sm font-bold", isCorrect(parseFloat(numericalInput)) ? "text-emerald-600" : "text-red-600")}>
                {isCorrect(parseFloat(numericalInput)) ? "Correct Answer!" : `Incorrect. Correct Answer: ${typeof question.answer === 'object' ? `${(question.answer as any).min} - ${(question.answer as any).max}` : question.answer}`}
              </p>
            </div>
          )}
        </div>
        {!disabled && (
          <Button 
            onClick={handleNumericalSubmit} 
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-100"
          >
            Save Answer
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
        <JeeQuestion question={question.question_text} className="text-lg sm:text-xl font-medium leading-relaxed text-slate-800" />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {question.type === 'MCQ' && renderMCQ()}
        {question.type === 'AR' && renderAR()}
        {question.type === 'NUMERICAL' && renderNumerical()}
      </div>
    </div>
  );
};

export default QuestionRenderer;
