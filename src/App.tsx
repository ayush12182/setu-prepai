import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import LearnPage from "./pages/LearnPage";
import ChapterPage from "./pages/ChapterPage";
import SubchapterPage from "./pages/SubchapterPage";
import PracticePage from "./pages/PracticePage";
import TestPage from "./pages/TestPage";
import RevisionPage from "./pages/RevisionPage";
import LectureSetu from "./pages/LectureSetu";
import AskJeetuPage from "./pages/AskJeetuPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/chapter/:chapterId" element={<ChapterPage />} />
            <Route path="/subchapter/:subchapterId" element={<SubchapterPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/revision" element={<RevisionPage />} />
            <Route path="/lecture-setu" element={<LectureSetu />} />
            <Route path="/ask-jeetu" element={<AskJeetuPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
