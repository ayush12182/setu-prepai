/**
 * activityTracker.ts
 * Central utility that updates ALL dashboard state in localStorage
 * whenever a student reads notes OR attempts a question.
 * This is the single source of truth for dashboard reactivity.
 */

export interface LastChapterPayload {
  subject: string;
  subjectLabel: string;
  chapterId: string;
  chapterName: string;
  chapterNum: string;
  tab: string;
  accent?: string;
  bg?: string;
  IconName?: string;
}

/** Called whenever a student navigates to a chapter page or tab */
export function trackChapterVisit(payload: LastChapterPayload) {
  try {
    localStorage.setItem('last_chapter', JSON.stringify(payload));
    // Update streak
    updateStreak();
    // Dispatch custom event so StudentHubPage re-reads without a full reload
    window.dispatchEvent(new CustomEvent('prepentrance:activity', { detail: { type: 'chapter_visit', ...payload } }));
  } catch { /* ignore */ }
}

/** Called whenever a student reads notes (navigates to notes page or opens a note type) */
export function trackNotesRead(chapterId: string, subject: string, chapterName: string) {
  try {
    // Mark chapter as "notes viewed" in per-chapter progress
    const key = `ch_progress_${chapterId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    if (!existing.notesRead) {
      existing.notesRead = true;
      existing.notesReadAt = Date.now();
      localStorage.setItem(key, JSON.stringify(existing));
      // Bump subject progress by 1 chapter weight
      bumpSubjectProgress(subject, chapterId);
    }
    updateStreak();
    window.dispatchEvent(new CustomEvent('prepentrance:activity', { detail: { type: 'notes_read', chapterId, subject, chapterName } }));
  } catch { /* ignore */ }
}

/** Called whenever a student submits an answer (right or wrong) */
export function trackQuestionAttempt(isCorrect: boolean, subject?: string, chapterId?: string) {
  try {
    // Increment total questions solved
    const prevSolved = Number(localStorage.getItem('total_questions_solved') || '0');
    localStorage.setItem('total_questions_solved', String(prevSolved + 1));

    // Update running accuracy
    const prevCorrect = Number(localStorage.getItem('total_questions_correct') || '0');
    const newCorrect  = prevCorrect + (isCorrect ? 1 : 0);
    localStorage.setItem('total_questions_correct', String(newCorrect));
    const newAccuracy = Math.round((newCorrect / (prevSolved + 1)) * 100);
    localStorage.setItem('avg_accuracy', String(newAccuracy));

    // Bump chapter-level practice flag
    if (chapterId) {
      const key = `ch_progress_${chapterId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      existing.practiceAttempts = (existing.practiceAttempts || 0) + 1;
      existing.lastPracticeAt = Date.now();
      localStorage.setItem(key, JSON.stringify(existing));
      if (subject) bumpSubjectProgress(subject, chapterId);
    }

    updateStreak();
    window.dispatchEvent(new CustomEvent('prepentrance:activity', {
      detail: { type: 'question_attempt', isCorrect, subject, chapterId, totalSolved: prevSolved + 1, accuracy: newAccuracy }
    }));
  } catch { /* ignore */ }
}

/** Bumps `progress_${subject}` based on how many chapters have been touched */
function bumpSubjectProgress(subject: string, chapterId: string) {
  try {
    // Track which chapters have been touched per subject
    const touchedKey = `touched_chapters_${subject}`;
    const touched: string[] = JSON.parse(localStorage.getItem(touchedKey) || '[]');
    if (!touched.includes(chapterId)) {
      touched.push(chapterId);
      localStorage.setItem(touchedKey, JSON.stringify(touched));
    }

    // Calculate per-subject chapter counts (Physics=15, Chem=16, Maths=16, Bio=38 etc.)
    // We read the subject-specific total from the chapter list length or use a safe default
    const subjectChapterCounts: Record<string, number> = {
      physics: 15, chemistry: 16, maths: 16, biology: 38
    };
    const total = subjectChapterCounts[subject] || 15;
    const pct   = Math.min(100, Math.round((touched.length / total) * 100));
    localStorage.setItem(`progress_${subject}`, String(pct));
  } catch { /* ignore */ }
}

/** Maintains a daily study streak based on activity timestamps */
function updateStreak() {
  try {
    const now      = new Date();
    const today    = now.toDateString();
    const lastDay  = localStorage.getItem('streak_last_day');
    const streak   = Number(localStorage.getItem('study_streak') || '0');

    if (lastDay === today) return; // already counted today

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDay === yesterday.toDateString()) {
      // Consecutive day — increment
      localStorage.setItem('study_streak', String(streak + 1));
    } else if (!lastDay) {
      // First ever day
      localStorage.setItem('study_streak', '1');
    } else {
      // Streak broken
      localStorage.setItem('study_streak', '1');
    }

    localStorage.setItem('streak_last_day', today);
  } catch { /* ignore */ }
}
