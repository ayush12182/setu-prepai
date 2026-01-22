import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const AskJeetuPage: React.FC = () => {
  const { getGreeting, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getGreeting() + ' Kya doubt hai aaj? Subject, chapter, ya koi specific question - bolo, solve karenge!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    "Rotation vs Revolution kya difference hai?",
    "Integration by parts kab use karna chahiye?",
    "Organic Chemistry ke reaction mechanism kaise yaad karein?",
    "JEE Advanced ke liye Physics kaise prepare karein?"
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'hinglish' 
          ? `Bahut accha question hai! Dekho, isko samajhne ke liye pehle basics clear karo...

**Step 1:** Concept ko visualize karo
**Step 2:** Formula apply karo
**Step 3:** Practice problems solve karo

Koi aur doubt ho toh poocho! 💪`
          : `Great question! Let me break this down for you...

**Step 1:** Visualize the concept
**Step 2:** Apply the formula
**Step 3:** Solve practice problems

Feel free to ask more questions! 💪`
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  return (
    <MainLayout title="Ask Jeetu Bhaiya">
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Chat Header */}
        <div className="bg-card border border-border rounded-t-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-setu-saffron to-setu-saffron-light flex items-center justify-center">
            <span className="text-white font-bold text-lg">JB</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Jeetu Bhaiya</h2>
            <p className="text-xs text-setu-success flex items-center gap-1">
              <span className="w-2 h-2 bg-setu-success rounded-full"></span>
              Online • Your JEE Mentor
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-secondary/30 p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border rounded-bl-sm'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Quick questions to get started:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-xs bg-card border border-border rounded-full px-3 py-1.5 hover:border-setu-saffron transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-card border border-border rounded-b-xl p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleVoice}
              className={cn(
                isListening && 'bg-setu-saffron text-white border-setu-saffron'
              )}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your doubt here..."
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="btn-hero"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AskJeetuPage;
