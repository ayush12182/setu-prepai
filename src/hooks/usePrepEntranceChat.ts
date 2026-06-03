import { useState, useCallback } from 'react';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClassContext } from '@/contexts/ClassContext';
import { getResponseForQuery } from '@/lib/prepentranceMentor';

type Message = { role: 'user' | 'assistant'; content: any };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jeetu-chat`;

export const usePrepEntranceChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { examMode } = useExamMode();
  const { language } = useLanguage();
  const { aiContext } = useClassContext();

  const sendMessage = useCallback(async (
    messages: Message[],
    onDelta: (chunk: string) => void,
    onDone: () => void
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Edge function expects {message, history} — split from messages array
      const lastMsg = messages[messages.length - 1];
      const history = messages.slice(0, -1);
      const messageText = typeof lastMsg?.content === 'string'
        ? lastMsg.content
        : JSON.stringify(lastMsg?.content ?? '');

      let resp: Response | null = null;
      let retries = 0;
      const maxRetries = 3;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          if (retries > 0) {
            setError(`⚠️ Mentor is reconnecting... Retrying (${retries}/${maxRetries})`);
          }
          resp = await fetch(CHAT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              message: messageText,
              history,
              examMode: aiContext.learning_mode === 'foundation' ? 'foundation' : examMode,
              language,
              classContext: {
                ...aiContext,
                strict_class_only: true,
                strict_stage_control: true,
                teaching_style: aiContext.teaching_tone,
              }
            }),
          });
          
          if (resp.ok) {
            success = true;
          } else {
            retries++;
            if (retries < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          }
        } catch (e) {
          retries++;
          if (retries < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        }
      }

      if (!success || !resp) {
        setError("Working offline... Generating response locally...");
        const localResp = getResponseForQuery(messageText);
        const words = localResp.message.split(' ');
        for (let i = 0; i < words.length; i++) {
          onDelta((i === 0 ? "" : " ") + words[i]);
          await new Promise((resolve) => setTimeout(resolve, 55));
        }
        setIsLoading(false);
        onDone();
        return;
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch { /* ignore */ }
        }
      }

      onDone();
    } catch (e) {
      console.error("Chat error:", e);
      setError("⚠️ Mentor server temporarily unavailable.\n\nYou can:\n• Retry\n• Upload image again\n• Continue in offline doubt mode");
      
      // Fallback to local offline response
      const localResp = getResponseForQuery(messageText);
      const words = localResp.message.split(' ');
      for (let i = 0; i < words.length; i++) {
        onDelta((i === 0 ? "" : " ") + words[i]);
        await new Promise((resolve) => setTimeout(resolve, 55));
      }
      onDone();
    } finally {
      setIsLoading(false);
    }
  }, [examMode, language, aiContext]);

  return { sendMessage, isLoading, error };
};
