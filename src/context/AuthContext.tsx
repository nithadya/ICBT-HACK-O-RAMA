import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAdmin(
        session?.user?.role === 'admin' ||
        session?.user?.user_metadata?.role === 'admin' ||
        session?.user?.email === 'gamlathrasindu007@gmail.com' ||
        session?.user?.email === 'jmdevnath@gmail.com'
      );
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(
        session?.user?.role === 'admin' ||
        session?.user?.user_metadata?.role === 'admin' ||
        session?.user?.email === 'gamlathrasindu007@gmail.com' ||
        session?.user?.email === 'jmdevnath@gmail.com'
      );
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simple sign in attempt first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // If it's the admin account and login failed, try to create it
        if (email === "gamlathrasindu007@gmail.com") {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: {
                role: "admin",
                full_name: "Admin User"
              }
            }
          });

          if (signUpError) {
            throw signUpError;
          }

          // Show a specific message for admin signup
          toast({
            title: "Admin Account Setup",
            description: "Please check your email to verify your account.",
          });
          return;
        }
        throw error;
      }

      // If login successful and it's admin, ensure role is set
      if (data.user && email === "gamlathrasindu007@gmail.com") {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            role: "admin",
            full_name: "Admin User"
          }
        });

        if (updateError) {
          console.error('Failed to update admin role:', updateError);
        }
      }

      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      setLoading(true);
      // Force admin role for the specific email
      const finalRole = email === "gamlathrasindu007@gmail.com" ? "admin" : role;
      const finalName = email === "gamlathrasindu007@gmail.com" ? "Admin User" : fullName;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: finalName,
            role: finalRole,
          },
        },
      });
      if (error) throw error;
      toast({
        title: "Account created",
        description: "Please check your email to confirm your registration.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading: loading,
        signIn,
        signUp,
        signOut,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
