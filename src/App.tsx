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
import AskJeetuPage from "./pages/AskJeetuPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import RevisionTopicPage from "./pages/RevisionTopicPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import SetuCirclesPage from "./pages/SetuCirclesPage";
import CircleFocusRoomPage from "./pages/CircleFocusRoomPage";
import FoundationAssessmentPage from "./pages/FoundationAssessmentPage";
import LearningProfilePage from "./pages/LearningProfilePage";
import ConceptGraphPage from "./pages/ConceptGraphPage";
import LearningRoadmapPage from "./pages/LearningRoadmapPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import StudentHubPage from "./pages/StudentHubPage";
import AITeachingRoomPage from "./pages/AITeachingRoomPage";
import PricingPage from "./pages/PricingPage";

// B2B Pages
import B2BOverview from "./pages/B2B/B2BOverview";
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

// Assess
import B2BAssessmentTakerPage from "./pages/Assess/B2BAssessmentTakerPage";
import B2BLiveMonitor from "./pages/B2B/B2BLiveMonitor";

const queryClient = new QueryClient();

// ─── Route Guards ─────────────────────────────────────────────

/** Only teachers/mentors/admins can access the Teacher Portal (/b2b) */
const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();
  if (loading) return null;
  const type = profile?.user_type;
  if (!type) return <Navigate to="/auth" replace />;
  if (type === 'b2b_student') return <Navigate to="/student-hub" replace />;
  if (type === 'b2c_student') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

/** Only enrolled B2B students can access the Student Hub (/student-hub) */
const StudentHubRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();
  if (loading) return null;
  const type = profile?.user_type;
  if (!type) return <Navigate to="/auth" replace />;
  if (type === 'b2b_mentor' || type === 'b2b_institution' || type === 'admin') 
    return <Navigate to="/b2b" replace />;
  if (type === 'b2c_student') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
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
                    <Route path="/dashboard" element={<Index />} />
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
                    <Route path="/ask-jeetu" element={<AskJeetuPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/circles" element={<SetuCirclesPage />} />
                    <Route path="/circles/:roomId" element={<CircleFocusRoomPage />} />
                    <Route path="/foundation-assessment" element={<FoundationAssessmentPage />} />
                    <Route path="/diagnostic-test" element={<FoundationAssessmentPage />} /> {/* Legacy fallback */}
                    {/* B2B Assessment Taker - accessible without auth (students use share link) */}
                    <Route path="/assess/:sessionId" element={<B2BAssessmentTakerPage />} />
                    <Route path="/learning-profile" element={<LearningProfilePage />} />
                    <Route path="/concept-graph" element={<ConceptGraphPage />} />
                    <Route path="/learning-roadmap" element={<LearningRoadmapPage />} />
                    <Route path="/teacher-dashboard" element={<TeacherDashboardPage />} />
                    
                    {/* B2B Dashboard Routes — Teacher Portal (mentors only) */}
                    <Route path="/b2b" element={<TeacherRoute><span /></TeacherRoute>}>
                      <Route index element={<TeacherRoute><B2BOverview /></TeacherRoute>} />
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
                    
                    {/* Student Hub — B2B students only */}
                    <Route path="/student-hub" element={<StudentHubRoute><StudentHubPage /></StudentHubRoute>} />
                    <Route path="/teaching-room/:teacherId" element={<AITeachingRoomPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/premium" element={<PricingPage />} />
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
