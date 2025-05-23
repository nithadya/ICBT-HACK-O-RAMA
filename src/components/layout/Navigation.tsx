import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Brain,
  RefreshCcw,
  MessageSquare,
  Trophy,
  User,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Notes", href: "/notes", icon: BookOpen },
  { name: "Assignments", href: "/assignments", icon: ClipboardList },
  { name: "Courses", href: "/courses", icon: GraduationCap },
  { name: "Flashcards", href: "/flashcards", icon: Brain },
  { name: "Revision", href: "/revision", icon: RefreshCcw },
  { name: "Discussions", href: "/discussions", icon: MessageSquare },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
];

const Navigation = () => {
  return (
    <nav className="space-y-1">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )
          }
        >
          <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation; 