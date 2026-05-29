import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ExamModeProvider } from "@/contexts/ExamModeContext";
import { ClassProvider } from "@/contexts/ClassContext";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ExamSelectionPage from "./pages/ExamSelectionPage";
import PreparationPage from "./pages/PreparationPage";
import TutorialSessionsPage from "./pages/TutorialSessionsPage";
import ChapterPage from "./pages/ChapterPage";
import ChapterNotesPage from "./pages/ChapterNotesPage";
import SubchapterPage from "./pages/SubchapterPage";
import PracticePage from "./pages/PracticePage";
import TestPage from "./pages/TestPage";
import MajorTestPage from "./pages/MajorTestPage";
import RevisionPage from "./pages/RevisionPage";
import LectureSetu from "./pages/LectureSetu";
import AskSetuPage from "./pages/AskSetuPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import RevisionTopicPage from "./pages/RevisionTopicPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import SetuCirclesPage from "./pages/SetuCirclesPage";
import CircleFocusRoomPage from "./pages/CircleFocusRoomPage";
import BatchCommunePage from "./pages/BatchCommunePage";
import FoundationAssessmentPage from "./pages/FoundationAssessmentPage";
import LearningProfilePage from "./pages/LearningProfilePage";
import ConceptGraphPage from "./pages/ConceptGraphPage";
import LearningRoadmapPage from "./pages/LearningRoadmapPage";

import AITeachingRoomPage from "./pages/AITeachingRoomPage";
import AITeachersDirectoryPage from "./pages/AITeachersDirectoryPage";
import PricingPage from "./pages/PricingPage";

// Hub Pages — Setu v2 Public Exam Prep Hub
import ExamHubPage from "./pages/hub/ExamHubPage";
import ResourceCategoryPage from "./pages/hub/ResourceCategoryPage";

// B2B Pages
import Overview from "./pages/TeacherHub/Overview";
import B2BBatches from "./pages/B2B/B2BBatches";
import B2BMaterials from "./pages/B2B/B2BMaterials";
import B2BStudents from "./pages/B2B/B2BStudents";
import B2BTests from "./pages/B2B/B2BTests";
import B2BAnalytics from "./pages/B2B/B2BAnalytics";
import B2BInviteStudents from "./pages/B2B/B2BInviteStudents";
import B2BSettings from "./pages/B2B/B2BSettings";
import JoinBatchPage from "./pages/B2B/JoinBatchPage";

// Admin
import QuestionQCPanel from "./pages/Admin/QuestionQCPanel";
import QuestionGeneratorPage from "./pages/Admin/QuestionGeneratorPage";
import BulkPYQGenerator from "./pages/Admin/BulkPYQGenerator";
import AdaptivePracticePage from "./pages/AdaptivePracticePage";
import StudentAnalyticsPage from "./pages/B2B/StudentAnalyticsPage";
import MyBatchPage from "./pages/MyBatchPage";
import PlatformUpdatedPage from "./pages/PlatformUpdatedPage";
import StudentHubPage from "./pages/StudentHubPage";
import MaterialViewerPage from "./pages/MaterialViewerPage";

// Assess
import B2BAssessmentTakerPage from "./pages/Assess/B2BAssessmentTakerPage";
import B2BLiveMonitor from "./pages/B2B/B2BLiveMonitor";

const queryClient = new QueryClient();

// ─── Route Guards ─────────────────────────────────────────────
const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS === 'true';

/** Only teachers/admins can access the Teacher Portal (/b2b) */
const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  if (DEV_BYPASS) return <>{children}</>;
  const { profile, loading } = useAuth();
  if (loading) return null;
  const type = profile?.user_type;
  if (!type) return <Navigate to="/auth" replace />;

  // Students are directed to their hub
  if (type === 'student') return <Navigate to="/student-hub" replace />;

  return <>{children}</>;
};

/** Students go to /student-hub — but MUST have joined a batch first */
const StudentHubRoute = ({ children }: { children: React.ReactNode }) => {
  // DEV BYPASS: skip batch check entirely
  if (DEV_BYPASS) return <>{children}</>;

  const { profile, loading } = useAuth();
  const [hasBatch, setHasBatch] = useState<boolean | null>(null);

  useEffect(() => {
    if (!profile || profile.user_type !== 'student') return;
    // Check if this student has an entry in student_batch_map
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase
        .from('student_batch_map' as any)
        .select('id', { count: 'exact', head: true })
        .eq('student_id', (profile as any).user_id ?? profile.id)
        .then(({ count }) => setHasBatch((count ?? 0) > 0));
    });
  }, [profile]);

  if (loading) return null;
  const type = profile?.user_type;
  if (!type) return <Navigate to="/auth" replace />;

  // Teachers and Admins go to the B2B portal
  if (type === 'teacher' || type === 'admin' || type === 'b2b_institution') {
    return <Navigate to="/b2b" replace />;
  }

  // Allow all students (both individual and coaching) into the student hub
  return <>{children}</>;
};


/**
 * Redirects users who hit legacy B2C dashboard routes.
 * Teachers → /b2b  |  Students → /platform-updated  |  No auth → /auth
 */
const B2CGateRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile?.user_type) return <Navigate to="/auth" replace />;
  if (profile.user_type === 'teacher' || profile.user_type === 'admin' || profile.user_type === 'b2b_institution') return <Navigate to="/b2b" replace />;
  if (profile.user_type === 'student') return <Navigate to="/platform-updated" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <ExamModeProvider>
            <ClassProvider>
              <LanguageProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/select-exam" element={<ExamSelectionPage />} />
                    <Route path="/dashboard" element={<B2CGateRoute><Index /></B2CGateRoute>} />
                    <Route path="/platform-updated" element={<PlatformUpdatedPage />} />
                    <Route path="/learn" element={<PreparationPage />} />
                    <Route path="/preparation" element={<PreparationPage />} />
                    <Route path="/tutorial-sessions" element={<TutorialSessionsPage />} />
                    <Route path="/chapter/:chapterId" element={<ChapterPage />} />
                    <Route path="/chapter/:chapterId/notes" element={<ChapterNotesPage />} />
                    <Route path="/subchapter/:subchapterId" element={<SubchapterPage />} />
                    <Route path="/practice" element={<PracticePage />} />
                    <Route path="/test" element={<TestPage />} />
                    <Route path="/major-test" element={<MajorTestPage />} />
                    <Route path="/revision" element={<RevisionPage />} />
                    <Route path="/revision/:subject/:topic" element={<RevisionTopicPage />} />
                    <Route path="/lecture-setu" element={<LectureSetu />} />
                    <Route path="/ask-setu" element={<AskSetuPage />} />
                    <Route path="/my-batch" element={<MyBatchPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/circles" element={<SetuCirclesPage />} />
                    <Route path="/circles/:roomId" element={<CircleFocusRoomPage />} />
                    <Route path="/batch-commune" element={<BatchCommunePage />} />
                    <Route path="/foundation-assessment" element={<FoundationAssessmentPage />} />
                    <Route path="/diagnostic-test" element={<FoundationAssessmentPage />} /> {/* Legacy fallback */}
                    {/* B2B Assessment Taker - accessible without auth (students use share link) */}
                    <Route path="/assess/:sessionId" element={<B2BAssessmentTakerPage />} />
                    <Route path="/learning-profile" element={<LearningProfilePage />} />
                    <Route path="/concept-graph" element={<ConceptGraphPage />} />
                    <Route path="/learning-roadmap" element={<LearningRoadmapPage />} />
                    <Route path="/teacher-dashboard" element={<Navigate to="/b2b" replace />} />
                    
                    {/* B2B Dashboard Routes — Teacher Portal (teachers only) */}
                    <Route path="/b2b" element={<TeacherRoute><Outlet /></TeacherRoute>}>
                      <Route index element={<TeacherRoute><Overview /></TeacherRoute>} />
                      <Route path="batches" element={<TeacherRoute><B2BBatches /></TeacherRoute>} />
                      <Route path="materials" element={<TeacherRoute><B2BMaterials /></TeacherRoute>} />
                      <Route path="students" element={<TeacherRoute><B2BStudents /></TeacherRoute>} />
                      <Route path="tests" element={<TeacherRoute><B2BTests /></TeacherRoute>} />
                      <Route path="monitor/:sessionId" element={<TeacherRoute><B2BLiveMonitor /></TeacherRoute>} />
                      <Route path="analytics" element={<TeacherRoute><B2BAnalytics /></TeacherRoute>} />
                      <Route path="invite" element={<TeacherRoute><B2BInviteStudents /></TeacherRoute>} />
                      <Route path="settings" element={<TeacherRoute><B2BSettings /></TeacherRoute>} />
                    </Route>
                    
                    {/* Student Join Route */}
                    <Route path="/join/:inviteCode" element={<JoinBatchPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/qc" element={<QuestionQCPanel />} />
                    <Route path="/admin/question-generator" element={<QuestionGeneratorPage />} />
                    <Route path="/admin/bulk-pyq-generator" element={<BulkPYQGenerator />} />
                    
                    {/* Adaptive Practice Engine */}
                    <Route path="/practice/adaptive" element={<AdaptivePracticePage />} />

                    {/* Teacher analytics */}
                    <Route path="/teacher/student-analytics" element={<StudentAnalyticsPage />} />
                    
                    {/* Student Hub — B2B students only */}
                    <Route path="/student-hub" element={<StudentHubRoute><StudentHubPage /></StudentHubRoute>} />
                    {/* Material Viewer */}
                    <Route path="/materials/:id" element={<MaterialViewerPage />} />
                    <Route path="/ai-teachers" element={<AITeachersDirectoryPage />} />
                    <Route path="/teaching-room/:teacherId" element={<AITeachingRoomPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/premium" element={<PricingPage />} />

                    {/* ─── Setu v2 — Public Exam Prep Hub ──────────────── */}
                    {/* /hub → default to JEE Class 11 */}
                    <Route path="/hub" element={<Navigate to="/jee/class-11" replace />} />

                    {/* Exam shortcuts */}
                    <Route path="/jee" element={<Navigate to="/jee/class-11" replace />} />
                    <Route path="/neet" element={<Navigate to="/neet/class-11" replace />} />
                    <Route path="/cuet" element={<Navigate to="/cuet/class-12" replace />} />

                    {/* JEE */}
                    <Route path="/jee/class-11" element={<ExamHubPage />} />
                    <Route path="/jee/class-12" element={<ExamHubPage />} />
                    <Route path="/jee/droppers" element={<ExamHubPage />} />
                    <Route path="/jee/class-11/:category" element={<ResourceCategoryPage />} />
                    <Route path="/jee/class-12/:category" element={<ResourceCategoryPage />} />
                    <Route path="/jee/droppers/:category" element={<ResourceCategoryPage />} />

                    {/* NEET */}
                    <Route path="/neet/class-11" element={<ExamHubPage />} />
                    <Route path="/neet/class-12" element={<ExamHubPage />} />
                    <Route path="/neet/droppers" element={<ExamHubPage />} />
                    <Route path="/neet/class-11/:category" element={<ResourceCategoryPage />} />
                    <Route path="/neet/class-12/:category" element={<ResourceCategoryPage />} />
                    <Route path="/neet/droppers/:category" element={<ResourceCategoryPage />} />

                    {/* CUET */}
                    <Route path="/cuet/class-12" element={<ExamHubPage />} />
                    <Route path="/cuet/droppers" element={<ExamHubPage />} />
                    <Route path="/cuet/class-12/:category" element={<ResourceCategoryPage />} />
                    <Route path="/cuet/droppers/:category" element={<ResourceCategoryPage />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </LanguageProvider>
            </ClassProvider>
          </ExamModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
