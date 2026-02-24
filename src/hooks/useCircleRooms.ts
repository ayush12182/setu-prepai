import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCategory, CATEGORY_STYLES } from '@/data/circlesData';
import type { ExamType } from '@/data/circlesData';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CommuneRoom {
  id: string;
  title: string;
  subject: string;
  study_mode: string;
  exam_type: ExamType;
  created_by: string;
  expires_at: string;
  created_at: string;
}

export interface CommuneMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  category: string;
  content: string;
  created_at: string;
}

export interface PresenceMember {
  id: string;
  name: string;
  studying?: string;
  joinedAt: string;
}

export interface RoomState {
  room: CommuneRoom;
  studentCount: number;
  remainingMinutes: number;
}

export interface FocusRoomState {
  messages: CommuneMessage[];
  members: PresenceMember[];
  room: CommuneRoom | null;
  studentCount: number;
  remainingMinutes: number;
  sendMessage: (category: MessageCategory, text: string) => void;
  loading: boolean;
}

// ─── Helper: minutes remaining ─────────────────────────────────────────────

function getMinutesRemaining(expiresAt: string): number {
  return Math.max(0, (new Date(expiresAt).getTime() - Date.now()) / 60000);
}

// ─── Hook: useCircleRooms — list all active rooms ──────────────────────────

export function useCircleRooms(exam: ExamType) {
  const [roomStates, setRoomStates] = useState<RoomState[]>([]);

  const fetchRooms = useCallback(async () => {
    const { data, error } = await supabase
      .from('commune_rooms')
      .select('*')
      .eq('exam_type', exam)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch rooms:', error);
      return;
    }

    const rooms = (data ?? []) as CommuneRoom[];
    setRoomStates(rooms.map(room => ({
      room,
      studentCount: 0, // Will be updated by presence
      remainingMinutes: getMinutesRemaining(room.expires_at),
    })));
  }, [exam]);

  useEffect(() => {
    fetchRooms();

    // Listen for new rooms in realtime
    const channel = supabase
      .channel('commune-rooms-list')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'commune_rooms',
        filter: `exam_type=eq.${exam}`,
      }, () => {
        fetchRooms();
      })
      .subscribe();

    // Update remaining minutes every 30s
    const timer = setInterval(() => {
      setRoomStates(prev =>
        prev
          .map(rs => ({ ...rs, remainingMinutes: getMinutesRemaining(rs.room.expires_at) }))
          .filter(rs => rs.remainingMinutes > 0)
      );
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [exam, fetchRooms]);

  // Track presence per room to get student counts
  useEffect(() => {
    if (roomStates.length === 0) return;

    const channels = roomStates.map(rs => {
      const ch = supabase.channel(`room-presence-${rs.room.id}`, {
        config: { presence: { key: 'viewers' } },
      });

      ch.on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState();
        const count = Object.values(state).flat().length;
        setRoomStates(prev =>
          prev.map(r => r.room.id === rs.room.id ? { ...r, studentCount: count } : r)
        );
      }).subscribe();

      return ch;
    });

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [roomStates.length]); // Only re-subscribe when room count changes

  // Create room function
  const createRoom = useCallback(async (title: string, subject: string, studyMode: string, durationMinutes: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('Please login to create a room');
      return null;
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60000).toISOString();

    const { data, error } = await supabase
      .from('commune_rooms')
      .insert({
        title,
        subject,
        study_mode: studyMode,
        exam_type: exam,
        created_by: session.user.id,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create room');
      console.error(error);
      return null;
    }

    toast.success('Room created! 🎉');
    return data as CommuneRoom;
  }, [exam]);

  return { roomStates, createRoom };
}

// ─── Hook: useFocusRoom — join a specific room with realtime ───────────────

export function useFocusRoom(roomId: string): FocusRoomState {
  const { user, profile } = useAuth();
  const [room, setRoom] = useState<CommuneRoom | null>(null);
  const [messages, setMessages] = useState<CommuneMessage[]>([]);
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Student';

  // Fetch room and initial messages
  useEffect(() => {
    if (!roomId) return;

    const init = async () => {
      setLoading(true);

      // Fetch room
      const { data: roomData } = await supabase
        .from('commune_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomData) setRoom(roomData as CommuneRoom);

      // Fetch existing messages
      const { data: msgData } = await supabase
        .from('commune_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(200);

      if (msgData) setMessages(msgData as CommuneMessage[]);

      setLoading(false);
    };

    init();
  }, [roomId]);

  // Subscribe to realtime messages + presence
  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: user.id } },
    });

    // Realtime new messages via postgres_changes
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'commune_messages',
      filter: `room_id=eq.${roomId}`,
    }, (payload) => {
      const newMsg = payload.new as CommuneMessage;
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    // Presence tracking
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const presenceMembers: PresenceMember[] = [];
      Object.values(state).forEach((arr: any[]) => {
        arr.forEach((p: any) => {
          presenceMembers.push({
            id: p.user_id || p.presence_ref,
            name: p.user_name || 'Student',
            studying: p.studying,
            joinedAt: p.joined_at || new Date().toISOString(),
          });
        });
      });
      setMembers(presenceMembers);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          user_name: userName,
          studying: room?.subject || 'General',
          joined_at: new Date().toISOString(),
        });
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, user, userName, room?.subject]);

  // Send message
  const sendMessage = useCallback(async (category: MessageCategory, text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !user) return;

    const { error } = await supabase
      .from('commune_messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        user_name: userName,
        category,
        content: trimmed,
      });

    if (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
  }, [roomId, user, userName]);

  const remainingMinutes = room ? getMinutesRemaining(room.expires_at) : 0;

  return {
    messages,
    members,
    room,
    studentCount: members.length,
    remainingMinutes,
    sendMessage,
    loading,
  };
}
