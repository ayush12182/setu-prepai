import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
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
import B2BStudents from "./pages/B2B/B2BStudents";
import B2BTests from "./pages/B2B/B2BTests";
import B2BAnalytics from "./pages/B2B/B2BAnalytics";
import B2BInviteStudents from "./pages/B2B/B2BInviteStudents";
import B2BSettings from "./pages/B2B/B2BSettings";
import JoinBatchPage from "./pages/B2B/JoinBatchPage";

// Admin
import QuestionQCPanel from "./pages/Admin/QuestionQCPanel";

// Assess
import AssessmentFlowPage from "./pages/Assess/AssessmentFlowPage";
import B2BLiveMonitor from "./pages/B2B/B2BLiveMonitor";

const queryClient = new QueryClient();

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
                    <Route path="/learning-profile" element={<LearningProfilePage />} />
                    <Route path="/concept-graph" element={<ConceptGraphPage />} />
                    <Route path="/learning-roadmap" element={<LearningRoadmapPage />} />
                    <Route path="/teacher-dashboard" element={<TeacherDashboardPage />} />
                    
                    {/* B2B Dashboard Routes */}
                    <Route path="/b2b">
                      <Route index element={<B2BOverview />} />
                      <Route path="batches" element={<B2BBatches />} />
                      <Route path="students" element={<B2BStudents />} />
                      <Route path="tests" element={<B2BTests />} />
                      <Route path="monitor/:sessionId" element={<B2BLiveMonitor />} />
                      <Route path="analytics" element={<B2BAnalytics />} />
                      <Route path="invite" element={<B2BInviteStudents />} />
                      <Route path="settings" element={<B2BSettings />} />
                    </Route>
                    
                    {/* Student Join Route */}
                    <Route path="/join/:inviteCode" element={<JoinBatchPage />} />
                    
                    {/* Assessment Link Flow */}
                    <Route path="/assess/:sessionId" element={<AssessmentFlowPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/qc" element={<QuestionQCPanel />} />
                    
                    <Route path="/student-hub" element={<StudentHubPage />} />
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
