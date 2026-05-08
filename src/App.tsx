import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index/Index";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import ResetPassword from "./pages/ResetPassword";
import PortalHome from "./pages/PortalHome/PortalHome";
import TeachersList from "./pages/TeachersList/TeachersList";
import TeacherProfile from "./pages/TeacherProfile/TeacherProfile";
import Book from "./pages/Book/Book";
import Dashboard from "./pages/Dashboard/dashboard";
import TeacherOnboarding from "./pages/TeacherOnboarding";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
import About from "./pages/marketing/About";
import HowItWorks from "./pages/marketing/HowItWorks";
import Pricing from "./pages/marketing/Pricing";
import Contact from "./pages/marketing/Contact";
import NotFound from "./pages/NotFound/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/islamic" element={<PortalHome portal="islamic" />} />
            <Route path="/school" element={<PortalHome portal="school" />} />
            <Route path="/islamic/teachers" element={<TeachersList portal="islamic" />} />
            <Route path="/school/teachers" element={<TeachersList portal="school" />} />
            <Route path="/teachers/:id" element={<TeacherProfile />} />

            {/* Protected */}
            <Route path="/book/:id" element={<ProtectedRoute><Book /></ProtectedRoute>} />
            <Route path="/dashboard/student" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/teacher" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/:role" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/teacher/onboarding" element={<ProtectedRoute requireRole="teacher"><TeacherOnboarding /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
