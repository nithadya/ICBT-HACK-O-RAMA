import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { state: { from: location.pathname } });
    }
  }, [user, isLoading, navigate, location]);

  // Handle role-based access
  useEffect(() => {
    if (user) {
      const userRole = user.user_metadata?.role;
      const currentPath = location.pathname;

      // Define role-based access rules
      const requiresAdmin = currentPath.includes('/app/admin');
      const requiresContributor = currentPath.includes('/app/courses/manage');

      // Redirect based on role
      if (requiresAdmin && userRole !== 'admin') {
        navigate('/app');
      } else if (requiresContributor && userRole !== 'contributor' && userRole !== 'admin') {
        navigate('/app');
      }

      // Redirect to appropriate dashboard if at root /app path
      if (currentPath === '/app') {
        switch (userRole) {
          case 'admin':
            navigate('/app/admin');
            break;
          case 'contributor':
            navigate('/app/courses/manage');
            break;
          default:
            // Learner stays at /app which shows the main dashboard
            break;
        }
      }
    }
  }, [user, location, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Show loading state
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

  // Show error state if no user
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isMobileOpen={isSidebarOpen} closeMobileSidebar={closeSidebar} />
      <div className="md:pl-64 pt-16">
        <main className="container mx-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
