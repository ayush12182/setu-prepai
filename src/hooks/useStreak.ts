import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useStreak = () => {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateStreak = async () => {
            if (!user) {
                setStreak(0);
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch dates from all academic activities
                const [practiceRes, testRes, notesRes] = await Promise.all([
                    supabase.from('practice_sessions').select('started_at').eq('user_id', user.id).order('started_at', { ascending: false }).limit(30),
                    supabase.from('major_test_attempts').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
                    supabase.from('lecture_notes').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30)
                ]);

                const dates: string[] = [];

                practiceRes.data?.forEach(d => dates.push(d.started_at));
                testRes.data?.forEach(d => dates.push(d.created_at));
                notesRes.data?.forEach(d => dates.push(d.created_at));

                if (dates.length === 0) {
                    setStreak(0);
                    return;
                }

                // 2. Normalize and Deduplicate Dates
                // "Use DATE comparison only" -> toDateString()
                const activityDates = [...new Set(
                    dates.map(dateStr => new Date(dateStr).toDateString())
                )];

                // 3. Calculate Streak
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                // "IF today > last_activity + 1 day: streak = 1" (implies break reset)
                // "IF today == last_activity: keep streak unchanged"
                // "IF today == last_activity + 1 day: streak = streak + 1"

                // We iterate backwards from today/yesterday to find consecutive days
                let currentStreak = 0;
                let checkDate = activityDates.includes(today.toDateString()) ? today : yesterday;

                // If neither today nor yesterday has activity, streak is 0 (broken)
                if (!activityDates.includes(today.toDateString()) && !activityDates.includes(yesterday.toDateString())) {
                    setStreak(0);
                    return;
                }

                // Count backward
                for (let i = 0; i < 365; i++) {
                    if (activityDates.includes(checkDate.toDateString())) {
                        currentStreak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        break;
                    }
                }

                setStreak(currentStreak);
            } catch (err) {
                console.error('Error calculating streak:', err);
                setStreak(0);
            } finally {
                setLoading(false);
            }
        };

        calculateStreak();
    }, [user]);

    return { streak, loading };
};
