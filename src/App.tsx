import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ExamModeProvider } from "@/contexts/ExamModeContext";
import { ClassProvider } from "@/contexts/ClassContext";
import { ErrorBoundary, PageLoader } from "@/components/ErrorBoundary";
import { TrialGate } from "./components/trial/TrialGate";

// ─── Eagerly loaded (small/critical path pages) ───────────────
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import PricingPage from "./pages/PricingPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import BatchesPage from "./pages/BatchesPage";
import BatchDetailPage from "./pages/BatchDetailPage";

// ─── Lazily loaded (large pages — split into separate chunks) ──
const StudentHubPage = lazy(() => import("./pages/StudentHubPage"));
const PracticeTestsPage = lazy(() => import("./pages/PracticeTestsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));
const AITeachingRoomPage = lazy(() => import("./pages/AITeachingRoomPage"));
const AITeachersDirectoryPage = lazy(() => import("./pages/AITeachersDirectoryPage"));
const TestPage = lazy(() => import("./pages/TestPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const AdaptivePracticePage = lazy(() => import("./pages/AdaptivePracticePage"));
const AskPrepEntrancePage = lazy(() => import("./pages/AskPrepEntrancePage"));
const RevisionPage = lazy(() => import("./pages/RevisionPage"));
const RevisionTopicPage = lazy(() => import("./pages/RevisionTopicPage"));
const LecturePrepEntrance = lazy(() => import("./pages/LecturePrepEntrance"));
const MajorTestPage = lazy(() => import("./pages/MajorTestPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PreparationPage = lazy(() => import("./pages/PreparationPage"));
const ChapterPage = lazy(() => import("./pages/ChapterPage"));
const ChapterNotesPage = lazy(() => import("./pages/ChapterNotesPage"));
const SubchapterPage = lazy(() => import("./pages/SubchapterPage"));
const MaterialViewerPage = lazy(() => import("./pages/MaterialViewerPage"));
const FoundationAssessmentPage = lazy(() => import("./pages/FoundationAssessmentPage"));
const LearningProfilePage = lazy(() => import("./pages/LearningProfilePage"));
const ConceptGraphPage = lazy(() => import("./pages/ConceptGraphPage"));
const LearningRoadmapPage = lazy(() => import("./pages/LearningRoadmapPage"));
const PrepEntranceCirclesPage = lazy(() => import("./pages/PrepEntranceCirclesPage"));
const CircleFocusRoomPage = lazy(() => import("./pages/CircleFocusRoomPage"));
const ExamHubPage = lazy(() => import("./pages/hub/ExamHubPage"));
const ResourceCategoryPage = lazy(() => import("./pages/hub/ResourceCategoryPage"));
const TutorialSessionsPage = lazy(() => import("./pages/TutorialSessionsPage"));

// Admin (lazy — admin-only, never hit by students)
const QuestionQCPanel = lazy(() => import("./pages/Admin/QuestionQCPanel"));
const QuestionGeneratorPage = lazy(() => import("./pages/Admin/QuestionGeneratorPage"));
const BulkPYQGenerator = lazy(() => import("./pages/Admin/BulkPYQGenerator"));


const queryClient = new QueryClient();

// ─── Route Guards ─────────────────────────────────────────────
const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS === 'true';

/** Admin Route Guard — requires login + admin/teacher role */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const isAdmin = profile.user_type === 'admin' || profile.user_type === 'teacher';
  if (!isAdmin && !DEV_BYPASS) return <Navigate to="/student-hub" replace />;

  return <>{children}</>;
};

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
                  <ErrorBoundary>
                    <Toaster />
                    <Sonner />
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
                        <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />
                        {/* Batch pages */}
                        <Route path="/batches" element={<BatchesPage />} />
                        <Route path="/batches/:slug" element={<BatchDetailPage />} />
                        <Route path="/select-exam" element={<Navigate to="/auth" replace />} />
                        <Route path="/dashboard" element={<Navigate to="/student-hub" replace />} />
                        <Route path="/platform-updated" element={<Navigate to="/student-hub" replace />} />
                        <Route path="/learn" element={<PreparationPage />} />
                        <Route path="/preparation" element={<PreparationPage />} />
                        <Route path="/tutorial-sessions" element={<TutorialSessionsPage />} />
                        <Route path="/chapter/:chapterId" element={<ChapterPage />} />
                        <Route path="/chapter/:chapterId/notes" element={<ChapterNotesPage />} />
                        <Route path="/subchapter/:subchapterId" element={<SubchapterPage />} />
                        <Route path="/practice" element={<TrialGate><PracticePage /></TrialGate>} />
                        <Route path="/test" element={<TrialGate><TestPage /></TrialGate>} />
                        <Route path="/major-test" element={<TrialGate><MajorTestPage /></TrialGate>} />
                        <Route path="/revision" element={<TrialGate><RevisionPage /></TrialGate>} />
                        <Route path="/revision/:subject/:topic" element={<TrialGate><RevisionTopicPage /></TrialGate>} />
                        <Route path="/lecture-prepentrance" element={<LecturePrepEntrance />} />
                        <Route path="/ask-prepentrance" element={<TrialGate><AskPrepEntrancePage /></TrialGate>} />
                        <Route path="/my-batch" element={<Navigate to="/student-hub" replace />} />
                        <Route path="/analytics" element={<TrialGate><AnalyticsPage /></TrialGate>} />
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
                        
                        {/* Admin Routes — protected by role check */}
                        <Route path="/admin/qc" element={<AdminRoute><QuestionQCPanel /></AdminRoute>} />
                        <Route path="/admin/question-generator" element={<AdminRoute><QuestionGeneratorPage /></AdminRoute>} />
                        <Route path="/admin/bulk-pyq-generator" element={<AdminRoute><BulkPYQGenerator /></AdminRoute>} />
                        
                        {/* Adaptive Practice Engine */}
                        <Route path="/practice/adaptive" element={<TrialGate><AdaptivePracticePage /></TrialGate>} />

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
                        <Route path="/practice-tests" element={<PracticeTestsPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:slug" element={<BlogDetailPage />} />

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
                    </Suspense>
                  </ErrorBoundary>
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
