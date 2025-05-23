import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  FlaskConical,
  Home,
  Layers,
  FileText,
  MessageCircle,
  FileCheck,
  Trophy,
  Users,
  Settings,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type NavItem = {
  title: string;
  href: string;
  icon: JSX.Element;
  badge?: string | number;
  adminOnly?: boolean;
  contributorOnly?: boolean;
};

const Sidebar = ({ isMobileOpen, closeMobileSidebar }: { isMobileOpen: boolean; closeMobileSidebar: () => void }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const userRole = user?.user_metadata?.role;

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .limit(5);
      
      if (error) throw error;
      
      setEnrolledCourses(data || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const navItems: NavItem[] = [
    // Common dashboard for all users
    {
      title: "Dashboard",
      href: "/app",
      icon: <Home className="h-5 w-5" />,
    },
    // Admin dashboard
    {
      title: "Admin Dashboard",
      href: "/app/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      adminOnly: true,
    },
    // Contributor dashboard
    {
      title: "Course Management",
      href: "/app/courses/manage",
      icon: <BookOpen className="h-5 w-5" />,
      contributorOnly: true,
    },
    // Regular navigation items
    {
      title: "Courses",
      href: "/app/courses",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Notes",
      href: "/app/notes",
      icon: <FileText className="h-5 w-5" />,
      badge: 3,
    },
    {
      title: "Flashcards",
      href: "/app/flashcards",
      icon: <Layers className="h-5 w-5" />,
    },
    {
      title: "Revision Tracker",
      href: "/app/revision",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Discussions",
      href: "/app/discussions",
      icon: <MessageCircle className="h-5 w-5" />,
      badge: "New",
    },
    {
      title: "Assignments",
      href: "/app/assignments",
      icon: <FileCheck className="h-5 w-5" />,
    },
    {
      title: "Leaderboard",
      href: "/app/leaderboard",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      title: "Payments",
      href: "/app/payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/app/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.contributorOnly && userRole !== 'contributor' && !isAdmin) return false;
    return true;
  });

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 md:z-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 pt-16 transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ScrollArea className="h-full py-4 px-2">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 mb-1 transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 dark:from-blue-950 dark:to-purple-950 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant={typeof item.badge === "number" ? "default" : "outline"} className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>

          {enrolledCourses.length > 0 && (
            <div className="mt-8 px-3">
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-3">
                MY COURSES
              </h3>
              <div className="space-y-1">
                {enrolledCourses.map((course) => (
                  <NavLink
                    key={course.id}
                    to={`/courses/${course.id}`}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 dark:from-blue-950 dark:to-purple-950 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`
                    }
                  >
                    <FlaskConical className="h-4 w-4" />
                    <span className="truncate">{course.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </aside>
    </>
  );
};

export default Sidebar;
