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
import LecturePrepEntrance from "./pages/LecturePrepEntrance";
import AskPrepEntrancePage from "./pages/AskPrepEntrancePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import RevisionTopicPage from "./pages/RevisionTopicPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import PrepEntranceCirclesPage from "./pages/PrepEntranceCirclesPage";
import CircleFocusRoomPage from "./pages/CircleFocusRoomPage";
import BatchCommunePage from "./pages/BatchCommunePage";
import FoundationAssessmentPage from "./pages/FoundationAssessmentPage";
import LearningProfilePage from "./pages/LearningProfilePage";
import ConceptGraphPage from "./pages/ConceptGraphPage";
import LearningRoadmapPage from "./pages/LearningRoadmapPage";

import AITeachingRoomPage from "./pages/AITeachingRoomPage";
import AITeachersDirectoryPage from "./pages/AITeachersDirectoryPage";
import PricingPage from "./pages/PricingPage";

// Hub Pages — PrepEntrance v2 Public Exam Prep Hub
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

/** Direct B2C Student Hub Route Access Guard */
const StudentHubRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

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
                    <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
                    <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />
                    <Route path="/select-exam" element={<Navigate to="/auth" replace />} />
                    <Route path="/dashboard" element={<Navigate to="/student-hub" replace />} />
                    <Route path="/platform-updated" element={<Navigate to="/student-hub" replace />} />
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
                    <Route path="/lecture-prepentrance" element={<LecturePrepEntrance />} />
                    <Route path="/ask-prepentrance" element={<AskPrepEntrancePage />} />
                    <Route path="/my-batch" element={<Navigate to="/student-hub" replace />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/circles" element={<PrepEntranceCirclesPage />} />
                    <Route path="/circles/:roomId" element={<CircleFocusRoomPage />} />
                    <Route path="/batch-commune" element={<Navigate to="/student-hub" replace />} />
                    <Route path="/foundation-assessment" element={<FoundationAssessmentPage />} />
                    <Route path="/diagnostic-test" element={<FoundationAssessmentPage />} /> {/* Legacy fallback */}
                    {/* B2B Assessment Taker - redirect since we are pure B2C */}
                    <Route path="/assess/:sessionId" element={<Navigate to="/student-hub" replace />} />
                    <Route path="/learning-profile" element={<LearningProfilePage />} />
                    <Route path="/concept-graph" element={<ConceptGraphPage />} />
                    <Route path="/learning-roadmap" element={<LearningRoadmapPage />} />
                    <Route path="/teacher-dashboard" element={<Navigate to="/student-hub" replace />} />
                    
                    {/* B2B Dashboard Routes — Redirect to Student Hub */}
                    <Route path="/b2b" element={<Navigate to="/student-hub" replace />} />
                    
                    {/* Student Join Route */}
                    <Route path="/join/:inviteCode" element={<Navigate to="/student-hub" replace />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/qc" element={<QuestionQCPanel />} />
                    <Route path="/admin/question-generator" element={<QuestionGeneratorPage />} />
                    <Route path="/admin/bulk-pyq-generator" element={<BulkPYQGenerator />} />
                    
                    {/* Adaptive Practice Engine */}
                    <Route path="/practice/adaptive" element={<AdaptivePracticePage />} />

                    {/* Teacher analytics */}
                    <Route path="/teacher/student-analytics" element={<Navigate to="/student-hub" replace />} />
                    
                    {/* Student Hub */}
                    <Route path="/student-hub" element={<StudentHubRoute><StudentHubPage /></StudentHubRoute>} />
                    {/* Material Viewer */}
                    <Route path="/materials/:id" element={<MaterialViewerPage />} />
                    <Route path="/ai-teachers" element={<AITeachersDirectoryPage />} />
                    <Route path="/teaching-room/:teacherId" element={<AITeachingRoomPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/premium" element={<PricingPage />} />

                    {/* ─── PrepEntrance v2 — Public Exam Prep Hub ──────────────── */}
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
