import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

import MainLayout from "@/components/layout/MainLayout";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ContributorDashboard from "@/pages/ContributorDashboard";
import NotFound from "@/pages/NotFound";
import Notes from "@/pages/Notes";
import Assignments from "@/pages/Assignments";
import Courses from "@/pages/Courses";
import CourseManagement from "@/pages/CourseManagement";
import Flashcards from "@/pages/Flashcards";
import RevisionTracker from "@/pages/RevisionTracker";
import CollaborativeBoard from "@/pages/CollaborativeBoard";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import { useAuth } from "@/context/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-blue-600 border-r-blue-600 border-b-purple-600 border-l-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                {/* Main Dashboard (default for learners) */}
                <Route index element={<Dashboard />} />
                
                {/* Role-specific Dashboards */}
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="courses/manage" element={<CourseManagement />} />
                
                {/* Common Routes */}
                <Route path="discussions" element={<CollaborativeBoard />} />
                <Route path="notes" element={<Notes />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="courses" element={<Courses />} />
                <Route path="flashcards" element={<Flashcards />} />
                <Route path="revision" element={<RevisionTracker />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
