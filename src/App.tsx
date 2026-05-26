import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index/Index";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import ChooseRole from "./pages/ChooseRole/ChooseRole";
import ResetPassword from "./pages/ResetPassword";
import PortalHome from "./pages/PortalHome/PortalHome";
import TeachersList from "./pages/TeachersList/TeachersList";
import TeacherProfile from "./pages/TeacherProfile/TeacherProfile";
import Book from "./pages/Book/Book";
import Dashboard from "./pages/Dashboard/dashboard";
import Assignments from "./pages/Assignments/Assignments";
import Notes from "./pages/Notes/Notes";
import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";
import TeacherOnboarding from "./pages/TeacherOnboarding";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Bookings from "./pages/Bookings";
import StudentReports from "./pages/StudentReports/StudentReports";
import Community from "./pages/Community/Community";
import About from "./pages/marketing/About";
import HowItWorks from "./pages/marketing/HowItWorks";
import Pricing from "./pages/marketing/Pricing";
import Contact from "./pages/marketing/Contact";
import NotFound from "./pages/NotFound/NotFound";

// Islamic Landing Pages
import IslamicLandingPage from "./pages/IslamicLandingPage/IslamicLandingPage";
import IslamicAbout from "./pages/IslamicLandingPage/About";
import IslamicContact from "./pages/IslamicLandingPage/Contact";
import IslamicTermsPrivacy from "./pages/IslamicLandingPage/TermsPrivacy";

// School Tutoring Landing Pages
import SchoolTutoringLandingPage from "./pages/SchoolTutoringLandingPage/SchoolTutoringLandingPage";
import SchoolAbout from "./pages/SchoolTutoringLandingPage/About";
import SchoolContact from "./pages/SchoolTutoringLandingPage/Contact";
import SchoolTermsPrivacy from "./pages/SchoolTutoringLandingPage/TermsPrivacy";

const queryClient = new QueryClient();

const DashboardRedirect = () => {
  const { role, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!role && roles.length > 1) {
    return <Navigate to="/choose-role" replace />;
  }

  return <Navigate to={role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"} replace />;
};

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
            <Route path="/choose-role" element={<ProtectedRoute skipRoleCheck><ChooseRole /></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />

            {/* Islamic Landing Pages */}
            <Route path="/islamiclandingpage" element={<IslamicLandingPage />} />
            <Route path="/islamiclandingpage/about" element={<IslamicAbout />} />
            <Route path="/islamiclandingpage/contact" element={<IslamicContact />} />
            <Route path="/islamiclandingpage/terms" element={<IslamicTermsPrivacy />} />

            {/* School Tutoring Landing Pages */}
            <Route path="/schooltutoringLandingPage" element={<SchoolTutoringLandingPage />} />
            <Route path="/schooltutoringLandingPage/about" element={<SchoolAbout />} />
            <Route path="/schooltutoringLandingPage/contact" element={<SchoolContact />} />
            <Route path="/schooltutoringLandingPage/terms" element={<SchoolTermsPrivacy />} />

            {/* Portal Routes */}
            <Route path="/islamic" element={<PortalHome portal="islamic" />} />
            <Route path="/school" element={<PortalHome portal="school" />} />
            <Route path="/islamic/teachers" element={<TeachersList portal="islamic" />} />
            <Route path="/school/teachers" element={<TeachersList portal="school" />} />
            <Route path="/teachers/:id" element={<TeacherProfile />} />

            {/* Protected */}
            <Route path="/book/:id" element={<ProtectedRoute><Book /></ProtectedRoute>} />
            <Route path="/dashboard/student" element={<ProtectedRoute requireRole="student"><Dashboard /></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute requireRole="student"><Assignments /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute requireRole="student"><Notes /></ProtectedRoute>} />
            <Route path="/dashboard/teacher" element={<ProtectedRoute requireRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/dashboard/:role" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/teacher/onboarding" element={<ProtectedRoute requireRole="teacher"><TeacherOnboarding /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute requireRole="student"><StudentReports /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
