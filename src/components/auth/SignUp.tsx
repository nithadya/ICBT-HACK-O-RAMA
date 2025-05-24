import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface SignUpProps {
  onModeChange: () => void;
}

type UserRole = 'learner' | 'contributor';

export function SignUp({ onModeChange }: SignUpProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("learner");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Additional states for contributor
  const [institution, setInstitution] = useState("");
  const [qualification, setQualification] = useState("");
  const [expertise, setExpertise] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "Full name is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    // Contributor-specific validation
    if (role === 'contributor') {
      if (!institution) newErrors.institution = "Institution is required";
      if (!qualification) newErrors.qualification = "Qualification is required";
      if (!expertise) newErrors.expertise = "Area of expertise is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = {
        full_name: name,
        role: role,
        ...(role === 'contributor' && {
          institution,
          qualification,
          expertise,
          status: 'pending' // Contributors need approval
        })
      };

      await signUp(email, password, { data: userData });
      
      if (role === 'contributor') {
        toast({
          title: "Account Created",
          description: "Your contributor account is pending approval. We'll notify you once it's approved.",
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email for verification.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container relative min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[450px]"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1 }}
              className="absolute -top-1/2 right-0 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"
            />
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute -bottom-1/2 left-0 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl"
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
              <UserPlus className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-none bg-white/70 backdrop-blur-lg dark:bg-gray-800/70">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Create Account
                </CardTitle>
                <CardDescription className="text-center">
                  Join our community today
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
                    <div className="absolute inset-0 w-3 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 transition-all duration-[250ms] ease-out group-hover:w-full" />
                    <span className="relative flex items-center justify-center gap-2 text-gray-600 group-hover:text-white transition-colors duration-[250ms] dark:text-gray-300">
                      <img src="/google.svg" alt="Google" className="h-5 w-5" />
                      Sign up with Google
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
                      <Label className="text-muted-foreground">
                        I want to join as
                      </Label>
                      <RadioGroup
                        value={role}
                        onValueChange={(value: UserRole) => setRole(value)}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="learner" id="learner" />
                          <Label htmlFor="learner">Learner</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="contributor" id="contributor" />
                          <Label htmlFor="contributor">Contributor</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-muted-foreground">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          type="text"
                          className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoCapitalize="words"
                          autoComplete="name"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {role === 'contributor' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="institution" className="text-muted-foreground">
                            Institution
                          </Label>
                          <Input
                            id="institution"
                            placeholder="Your Institution"
                            type="text"
                            className={`${errors.institution ? 'border-red-500' : ''}`}
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            disabled={isLoading}
                          />
                          {errors.institution && (
                            <p className="text-sm text-red-500">{errors.institution}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="qualification" className="text-muted-foreground">
                            Qualification
                          </Label>
                          <Input
                            id="qualification"
                            placeholder="Your Highest Qualification"
                            type="text"
                            className={`${errors.qualification ? 'border-red-500' : ''}`}
                            value={qualification}
                            onChange={(e) => setQualification(e.target.value)}
                            disabled={isLoading}
                          />
                          {errors.qualification && (
                            <p className="text-sm text-red-500">{errors.qualification}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expertise" className="text-muted-foreground">
                            Area of Expertise
                          </Label>
                          <Input
                            id="expertise"
                            placeholder="Your Area of Expertise"
                            type="text"
                            className={`${errors.expertise ? 'border-red-500' : ''}`}
                            value={expertise}
                            onChange={(e) => setExpertise(e.target.value)}
                            disabled={isLoading}
                          />
                          {errors.expertise && (
                            <p className="text-sm text-red-500">{errors.expertise}</p>
                          )}
                        </div>
                      </>
                    )}

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

                    <div className="grid gap-4 md:grid-cols-2">
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
                            autoComplete="new-password"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-muted-foreground">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type="password"
                            className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoCapitalize="none"
                            autoComplete="new-password"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
              <CardFooter>
                <motion.div
                  className="text-center w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onModeChange();
                      }}
                      className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400"
                    >
                      Sign in
                    </a>
                  </div>
                </motion.div>
              </CardFooter>
            </Card>
            <motion.p
              className="text-center text-sm text-muted-foreground mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              By clicking continue, you agree to our{" "}
              <a
                href="/terms"
                className="hover:text-primary underline underline-offset-4"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="hover:text-primary underline underline-offset-4"
              >
                Privacy Policy
              </a>
              .
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 