import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getResponseForQuery, getGreetingByLanguage } from '@/lib/jeetuBhaiya';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AskJeetuPage: React.FC = () => {
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getGreetingByLanguage(language),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update greeting when language changes
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: getGreetingByLanguage(language),
        timestamp: new Date()
      }]);
    }
  }, [language]);

  const quickQuestions = [
    "Rotation vs Revolution kya difference hai?",
    "Integration by parts kab use karna chahiye?",
    "Organic reactions kaise yaad karein?",
    "JEE Advanced Physics kaise prepare karein?"
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay for natural feel
    const typingDelay = 800 + Math.random() * 700;
    
    setTimeout(() => {
      const response = getResponseForQuery(input);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, typingDelay);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
  };

  const formatMessage = (content: string) => {
    // Convert **text** to bold
    return content.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
          {i < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <MainLayout title="Ask Jeetu Bhaiya">
      <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
        {/* Chat Header */}
        <div className="bg-card border border-border rounded-t-2xl p-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-setu-saffron to-setu-saffron-light flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">JB</span>
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-setu-success rounded-full border-2 border-card"></span>
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-lg text-foreground">Jeetu Bhaiya</h2>
            <p className="text-sm text-setu-success flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Online • Your JEE Mentor
            </p>
          </div>
          <div className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
            PCM Only
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-secondary/30 p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                'flex animate-fade-in',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-setu-saffron/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <span className="text-setu-saffron font-bold text-xs">JB</span>
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border border-border rounded-bl-md shadow-sm'
                )}
              >
                <div className={cn(
                  'text-sm leading-relaxed whitespace-pre-wrap',
                  message.role === 'assistant' && 'text-foreground'
                )}>
                  {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-setu-saffron/20 flex items-center justify-center mr-2 flex-shrink-0">
                <span className="text-setu-saffron font-bold text-xs">JB</span>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick Questions - Show only at start */}
          {messages.length === 1 && !isTyping && (
            <div className="space-y-3 pt-4">
              <p className="text-xs text-muted-foreground font-medium">
                💡 Quick doubts to get started:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className={cn(
                      'text-sm bg-card border border-border rounded-xl px-4 py-2',
                      'hover:border-setu-saffron hover:bg-setu-saffron/5 transition-all duration-200',
                      'text-left'
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-card border border-border rounded-b-2xl p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleVoice}
              className={cn(
                'flex-shrink-0 rounded-xl',
                isListening && 'bg-setu-saffron text-white border-setu-saffron hover:bg-setu-saffron/90'
              )}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Apna doubt yahan likho..."
              className="min-h-[48px] max-h-32 resize-none rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="btn-hero flex-shrink-0 rounded-xl px-4"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AskJeetuPage;
