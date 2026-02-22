import { useState, useEffect, useCallback, useRef } from 'react';
import {
    CircleRoom,
    CircleMessage,
    MessageCategory,
    ALL_ROOMS,
    SIMULATED_MEMBERS,
    CircleMember,
    buildInitialMessages,
    MENTOR_MESSAGES_JEE,
    MENTOR_MESSAGES_NEET,
    MODERATION_RESPONSE,
} from '@/data/circlesData';
import { ExamType } from '@/data/circlesData';

// ─── Off-topic keyword detection (basic heuristic) ────────────────────────

const OFF_TOPIC_KEYWORDS = [
    'movie', 'cricket', 'ipl', 'web series', 'instagram', 'meme', 'tiktok',
    'politics', 'election', 'dating', 'girlfriend', 'boyfriend', 'party',
    'game', 'pubg', 'fortnite', 'netflix', 'amazon prime', 'gossip',
];

function isOffTopic(text: string): boolean {
    const lower = text.toLowerCase();
    return OFF_TOPIC_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── Room state ────────────────────────────────────────────────────────────

export interface RoomState {
    room: CircleRoom;
    studentCount: number;
    remainingMinutes: number;
}

export interface FocusRoomState {
    messages: CircleMessage[];
    members: CircleMember[];
    room: CircleRoom | null;
    studentCount: number;
    remainingMinutes: number;
    sendMessage: (category: MessageCategory, text: string) => void;
}

// ─── Hook: useCircleRooms ──────────────────────────────────────────────────

export function useCircleRooms(exam: ExamType) {
    const [roomStates, setRoomStates] = useState<RoomState[]>(() =>
        ALL_ROOMS
            .filter(r => r.exam === exam)
            .map(r => ({
                room: r,
                studentCount: r.baseStudentCount,
                remainingMinutes: Math.max(0, r.expiryMinutes - r.startedMinsAgo),
            }))
    );

    // Simulate live student count fluctuations every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setRoomStates(prev =>
                prev.map(rs => {
                    if (rs.remainingMinutes <= 0) return rs;
                    const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
                    const newCount = Math.max(1, rs.studentCount + delta);
                    const newRemaining = Math.max(0, rs.remainingMinutes - 1 / 7.5); // ~8s tick
                    return { ...rs, studentCount: newCount, remainingMinutes: newRemaining };
                })
            );
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return roomStates;
}

// ─── Hook: useFocusRoom ────────────────────────────────────────────────────

export function useFocusRoom(roomId: string): FocusRoomState {
    const room = ALL_ROOMS.find(r => r.id === roomId) ?? null;
    const exam: ExamType = room?.exam ?? 'jee';

    const [messages, setMessages] = useState<CircleMessage[]>(() =>
        room ? buildInitialMessages(exam, room.topic) : []
    );

    const [studentCount, setStudentCount] = useState(room?.baseStudentCount ?? 0);
    const [remainingMinutes, setRemainingMinutes] = useState(
        room ? Math.max(0, room.expiryMinutes - room.startedMinsAgo) : 0
    );

    const mentorMsgs = exam === 'neet' ? MENTOR_MESSAGES_NEET : MENTOR_MESSAGES_JEE;
    const mentorMsgIdx = useRef(0);

    // Countdown timer tick every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingMinutes(prev => Math.max(0, prev - 1));
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Simulate student count fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setStudentCount(prev => Math.max(1, prev + Math.floor(Math.random() * 5) - 2));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Mentor AI message injection every 45 seconds
    useEffect(() => {
        const timeout = setTimeout(() => {
            const idx = mentorMsgIdx.current % mentorMsgs.length;
            mentorMsgIdx.current += 1;
            const mentorMsg: CircleMessage = {
                id: `mentor-${Date.now()}`,
                senderId: 'mentor',
                senderName: exam === 'neet' ? 'NEET Mentor AI' : 'Jeetu Bhaiya AI',
                senderPoints: 999,
                category: 'Mentor',
                isMentor: true,
                text: mentorMsgs[idx],
                timestamp: new Date(),
                upvotes: 0,
            };
            setMessages(prev => [...prev, mentorMsg]);

            // Schedule next mentor message
        }, 45000);
        return () => clearTimeout(timeout);
    }, [messages.length, mentorMsgs, exam]);

    const sendMessage = useCallback((category: MessageCategory, text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const newMsg: CircleMessage = {
            id: `msg-${Date.now()}`,
            senderId: 'user',
            senderName: 'You',
            senderPoints: 0,
            category,
            text: trimmed,
            timestamp: new Date(),
            upvotes: 0,
        };

        setMessages(prev => [...prev, newMsg]);

        // Moderation check — if off-topic, AI responds after 1.5s
        if (isOffTopic(trimmed)) {
            setTimeout(() => {
                const modMsg: CircleMessage = {
                    id: `mod-${Date.now()}`,
                    senderId: 'mentor',
                    senderName: exam === 'neet' ? 'NEET Mentor AI' : 'Jeetu Bhaiya AI',
                    senderPoints: 999,
                    category: 'Mentor',
                    isMentor: true,
                    isModeration: true,
                    text: MODERATION_RESPONSE,
                    timestamp: new Date(),
                    upvotes: 0,
                };
                setMessages(prev => [...prev, modMsg]);
            }, 1500);
        }
    }, [exam]);

    // Subset of members for this room (random selection of 5–8)
    const members = SIMULATED_MEMBERS.slice(0, 7);

    return { messages, members, room, studentCount, remainingMinutes, sendMessage };
}
