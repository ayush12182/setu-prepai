import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useBatchInfo } from '@/hooks/useBatchInfo';
import { useFocusRoom } from '@/hooks/useCircleRooms';
import { supabase } from '@/integrations/supabase/client';
import { Users, Send, Image as ImageIcon, Flame, CheckCircle2, Circle, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function BatchCommunePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { info: batchInfo, loading: batchLoading } = useBatchInfo();
  
  const [roomId, setRoomId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [batchRoster, setBatchRoster] = useState<{ id: string; name: string }[]>([]);

  // 1. Initialize persistent batch room
  useEffect(() => {
    if (!user || batchLoading) return;
    if (!batchInfo) {
      toast.error("You must be in a batch to access the Batch Commune.");
      navigate('/student-hub');
      return;
    }

    const initBatchRoom = async () => {
      try {
        // Fetch full batch roster
        const { data: rosterData } = await supabase
          .from('student_batch_map')
          .select('student_id, profiles(full_name)')
          .eq('batch_id', batchInfo.batchId);

        if (rosterData) {
          const formatted = rosterData.map(r => ({
            id: r.student_id,
            name: (r.profiles as any)?.full_name || 'Student'
          }));
          setBatchRoster(formatted);
        }

        // Check for existing batch room
        const { data: existingRoom } = await supabase
          .from('commune_rooms')
          .select('id')
          .eq('title', `BATCH_${batchInfo.batchId}`)
          .maybeSingle();

        if (existingRoom) {
          setRoomId(existingRoom.id);
        } else {
          // Create persistent room
          const { data: newRoom, error } = await supabase
            .from('commune_rooms')
            .insert({
              title: `BATCH_${batchInfo.batchId}`,
              subject: 'Batch General',
              study_mode: 'doubts',
              exam_type: 'jee', // default, it's scoped by title anyway
              created_by: user.id,
              expires_at: new Date('2036-01-01').toISOString(),
            })
            .select('id')
            .single();

          if (error) throw error;
          if (newRoom) setRoomId(newRoom.id);
        }
      } catch (err) {
        console.error("Failed to init batch room:", err);
      } finally {
        setInitializing(false);
      }
    };

    initBatchRoom();
  }, [user, batchInfo, batchLoading, navigate]);

  return (
    <MainLayout title="Batch Commune">
      <div className="h-[calc(100vh-4rem)] bg-slate-950 flex flex-col items-center justify-center">
        {initializing || !roomId ? (
          <div className="animate-pulse flex flex-col items-center gap-4 text-white/50">
            <Flame className="w-10 h-10 text-emerald-400 opacity-50" />
            <p>Entering Batch Commune...</p>
          </div>
        ) : (
          <BatchCommuneArena roomId={roomId} batchInfo={batchInfo!} roster={batchRoster} />
        )}
      </div>
    </MainLayout>
  );
}

// ─── Inner Component for the Arena ─────────────────────────────────────────

function BatchCommuneArena({ roomId, batchInfo, roster }: { roomId: string, batchInfo: any, roster: any[] }) {
  const { messages, members: onlineMembers, sendMessage, uploadImage } = useFocusRoom(roomId);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sprintTimeLeft, setSprintTimeLeft] = useState<number>(0);
  const { user } = useAuth();
  
  // Calculate online/offline
  const onlineUserIds = new Set(onlineMembers.map(m => m.id));
  const offlineRoster = roster.filter(r => !onlineUserIds.has(r.id));

  // Feature 1: Active Sprint logic
  const activeSprintMessage = messages.slice().reverse().find(m => m.category === 'Sprint');
  
  useEffect(() => {
    if (!activeSprintMessage) return;
    const endTime = new Date(activeSprintMessage.content).getTime();
    
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setSprintTimeLeft(remaining);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSprintMessage]);

  // Feature 3: Active Broadcast
  const activeBroadcast = messages.slice().reverse().find(m => m.category === 'Broadcast');

  const startSprint = () => {
    const endTime = new Date(Date.now() + 25 * 60000).toISOString();
    sendMessage('Sprint', endTime);
    toast.success("Focus sprint started! 🍅");
  };

  const askJeetu = async (question: string) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return "Jeetu AI is offline (missing API key).";
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `You are Jeetu AI, an expert mentor for Indian students. Be concise, energetic, and helpful. Answer this doubt: ${question}` }] }],
          generationConfig: { temperature: 0.7 }
        })
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I got distracted. Ask again!";
    } catch {
      return "I'm having trouble connecting to my brain right now.";
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !selectedFile) return;

    const currentText = inputText.trim();
    setInputText('');
    
    if (selectedFile) {
      setUploading(true);
      const url = await uploadImage(selectedFile);
      setUploading(false);
      setSelectedFile(null);
      if (url) {
        sendMessage('Doubt', `[IMAGE] ${url}\n${currentText}`);
      }
    } else {
      sendMessage('Doubt', currentText);
    }

    // Feature 2: AI Jeetu Mentorship
    if (currentText.toLowerCase().startsWith('@jeetu')) {
      const question = currentText.substring(6).trim();
      if (!question) return;
      
      const aiReply = await askJeetu(question);
      await supabase.from('commune_messages').insert({
        room_id: roomId,
        user_id: '00000000-0000-0000-0000-000000000000',
        user_name: 'Jeetu AI 🤖',
        category: 'AI',
        content: aiReply
      });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full max-w-7xl mx-auto p-4 flex gap-4 overflow-hidden">
      
      {/* ─── Left: Chat / Study Feed ─── */}
      <div className="flex-1 flex flex-col bg-card/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-400" />
              {batchInfo.batchName} Commune
            </h2>
            <p className="text-xs text-white/50">Exclusive persistent study room for your batch</p>
          </div>
          <div className="flex items-center gap-3">
            {sprintTimeLeft > 0 ? (
              <div className="px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl font-mono text-lg font-bold animate-pulse">
                🍅 {formatTime(sprintTimeLeft)}
              </div>
            ) : (
              <Button onClick={startSprint} size="sm" variant="outline" className="bg-white/5 hover:bg-white/10 border-white/10 text-white/70">
                Start Sprint ⏱️
              </Button>
            )}
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {onlineMembers.length} Online
            </div>
          </div>
        </div>

        {/* Feature 3: Active Broadcast Pin */}
        {activeBroadcast && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 px-5 flex items-start gap-3">
            <div className="p-1.5 bg-amber-500/20 rounded-lg shrink-0 mt-0.5">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-500 mb-0.5">Teacher Broadcast</p>
              <p className="text-sm font-medium text-amber-100/90">{activeBroadcast.content}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
          {[...messages].reverse().map(msg => {
            if (msg.category === 'Sprint' || msg.category === 'Broadcast') return null; // Don't render these as normal messages
            if (msg.category === 'SOS') {
              return (
                <div key={msg.id} className="flex flex-col items-center my-4">
                  <div className="bg-rose-500/10 border border-rose-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <p className="text-sm font-bold text-rose-400">{msg.user_name} needs help!</p>
                      <p className="text-xs text-rose-400/70">{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            }

            const isMe = msg.user_id === user?.id;
            const isJeetu = msg.category === 'AI';
            const hasImage = msg.content.startsWith('[IMAGE] ');
            let imageUrl = '';
            let textContent = msg.content;
            if (hasImage) {
              const parts = msg.content.split('\n');
              imageUrl = parts[0].replace('[IMAGE] ', '');
              textContent = parts.slice(1).join('\n');
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-white/30 mb-1 px-1">{msg.user_name}</span>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  isMe ? 'bg-emerald-600/20 text-emerald-100 border border-emerald-500/30' : 
                  isJeetu ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' :
                  'bg-white/5 text-white/90 border border-white/10'
                }`}>
                  {hasImage && <img src={imageUrl} alt="Upload" className="max-w-[250px] rounded-lg mb-2 border border-white/10" />}
                  <p className="text-sm whitespace-pre-wrap">{textContent}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          {selectedFile && (
            <div className="mb-2 inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs text-white border border-white/20">
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="max-w-[200px] truncate">{selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)} className="hover:text-red-400 ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <button 
              onClick={() => document.getElementById('image-upload')?.click()}
              className="p-3 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <Input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a doubt or type @Jeetu to ask AI..."
              className="h-12 bg-white/5 border-white/10 focus-visible:ring-emerald-500/50 rounded-xl"
            />
            <Button 
              onClick={handleSend}
              disabled={uploading || (!inputText.trim() && !selectedFile)}
              className="h-12 w-12 p-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Right: Batchmates Roster ─── */}
      <div className="w-80 flex flex-col bg-card/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Batchmates
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Jeetu AI Fixed Member */}
          <div className="mb-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-500/[0.05] border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <div className="w-8 h-8 rounded-full bg-blue-950 flex items-center justify-center shrink-0 border border-blue-500/30">
                <span className="text-xl">🤖</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-50 truncate">Jeetu AI</p>
                <p className="text-[10px] text-blue-400/70">Always Online</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            </div>
          </div>

          {/* Online Section */}
          {onlineMembers.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-1">
                Online — {onlineMembers.length}
              </div>
              {onlineMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <span className="text-emerald-400 text-xs font-bold">{m.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-50 truncate">{m.id === user?.id ? 'You' : m.name}</p>
                    <p className="text-[10px] text-emerald-400/70">Grinding right now</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Offline Section */}
          {offlineRoster.length > 0 && (
            <div>
              <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">
                Offline — {offlineRoster.length}
              </div>
              {offlineRoster.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <span className="text-white/40 text-xs font-bold">{r.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/60 truncate">{r.name}</p>
                  </div>
                  <Circle className="w-3 h-3 text-white/10 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
