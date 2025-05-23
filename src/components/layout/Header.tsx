
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  Menu, 
  Moon, 
  Sun, 
  User,
  LogOut, 
  Settings,
  ChevronDown,
  Search
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ full_name: null, avatar_url: null });
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name,
          avatar_url: data.avatar_url,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="md:hidden mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/" className="flex items-center mr-4">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ClassSync
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search courses, notes, or topics..." 
              className="pl-9 w-[300px] lg:w-[400px]" 
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileSearchVisible(!isMobileSearchVisible)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[400px] overflow-auto">
                <div className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                  <p className="font-medium">New assignment posted</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Introduction to Computer Science - Due in 7 days</p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
                <div className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                  <p className="font-medium">Your note was favorited</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">3 people favorited your "Physics Formulas" note</p>
                  <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                </div>
                <div className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                  <p className="font-medium">Discussion reply</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Someone replied to your question about quantum mechanics</p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2 text-center">
                <Button variant="ghost" size="sm" className="w-full">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden sm:inline-block truncate max-w-[100px] lg:max-w-[150px]">
                    {profile.full_name || user.email}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      {isMobileSearchVisible && (
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input placeholder="Search..." className="pl-9 w-full" />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
