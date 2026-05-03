import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import PortalHome from "./pages/PortalHome";
import TeachersList from "./pages/TeachersList";
import TeacherProfile from "./pages/TeacherProfile";
import Book from "./pages/Book";
import Dashboard from "./pages/Dashboard";
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
          <Route path="/islamic" element={<PortalHome portal="islamic" />} />
          <Route path="/school" element={<PortalHome portal="school" />} />
          <Route path="/islamic/teachers" element={<TeachersList portal="islamic" />} />
          <Route path="/school/teachers" element={<TeachersList portal="school" />} />
          <Route path="/teachers/:id" element={<TeacherProfile />} />
          <Route path="/book/:id" element={<Book />} />
          <Route path="/dashboard/:role" element={<Dashboard />} />
          <Route path="/family" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
