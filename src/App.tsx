import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Library from "./pages/Library";
import StoryDetail from "./pages/StoryDetail";
// import CulturalMap from "./pages/CulturalMap";
// import ShareStory from "./pages/ShareStory";
import Quiz from "./pages/Quiz";
import Share from "./pages/Share";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import CulturalCalendar from "./pages/CulturalCalendar";
// import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/:id" element={<StoryDetail />} />
          {/* <Route path="/map" element={<CulturalMap />} /> */}
          {/* <Route path="/share" element={<ShareStory />} /> */}
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/share" element={<Share />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendrier-culturel" element={<CulturalCalendar />} />
          {/* <Route path="/admin" element={<Admin />} /> */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
