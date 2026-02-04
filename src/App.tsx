import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import PreparationPage from "./pages/PreparationPage";
import TutorialSessionsPage from "./pages/TutorialSessionsPage";
import ChapterPage from "./pages/ChapterPage";
import SubchapterPage from "./pages/SubchapterPage";
import PracticePage from "./pages/PracticePage";
import TestPage from "./pages/TestPage";
import MajorTestPage from "./pages/MajorTestPage";
import RevisionPage from "./pages/RevisionPage";
import LectureSetu from "./pages/LectureSetu";
import AskJeetuPage from "./pages/AskJeetuPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/learn" element={<PreparationPage />} />
              <Route path="/preparation" element={<PreparationPage />} />
              <Route path="/tutorial-sessions" element={<TutorialSessionsPage />} />
              <Route path="/chapter/:chapterId" element={<ChapterPage />} />
              <Route path="/subchapter/:subchapterId" element={<SubchapterPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/major-test" element={<MajorTestPage />} />
              <Route path="/revision" element={<RevisionPage />} />
              <Route path="/lecture-setu" element={<LectureSetu />} />
              <Route path="/ask-jeetu" element={<AskJeetuPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
