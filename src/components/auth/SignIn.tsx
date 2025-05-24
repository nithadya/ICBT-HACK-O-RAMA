import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SignInProps {
  onModeChange: () => void;
}

export function SignIn({ onModeChange }: SignInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      toast({
        title: "Success",
        description: "Successfully signed in!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container relative min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1 }}
              className="absolute -top-1/2 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
            />
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute -bottom-1/2 left-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl"
            />
          </div>

          <div className="mb-8 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-full bg-white/30 p-3 backdrop-blur-sm dark:bg-gray-800/30"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogIn className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-none bg-white/70 backdrop-blur-lg dark:bg-gray-800/70">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-center">
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  className="grid grid-cols-1 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="relative overflow-hidden group bg-white dark:bg-gray-800"
                    onClick={() => {}}
                  >
                    <div className="absolute inset-0 w-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-[250ms] ease-out group-hover:w-full" />
                    <span className="relative flex items-center justify-center gap-2 text-gray-600 group-hover:text-white transition-colors duration-[250ms] dark:text-gray-300">
                      <img src="/google.svg" alt="Google" className="h-5 w-5" />
                      Sign in with Google
                    </span>
                  </Button>
                </motion.div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground dark:bg-gray-800">
                      Or continue with
                    </span>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-muted-foreground">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          placeholder="name@example.com"
                          type="email"
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-muted-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoCapitalize="none"
                          autoComplete="current-password"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password}</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <motion.div
                  className="space-y-4 text-center w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <a
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                  <div className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onModeChange();
                      }}
                      className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      Sign up
                    </a>
                  </div>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 