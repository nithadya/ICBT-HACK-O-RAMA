import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const location = useLocation();
  const defaultTab = location.state?.defaultTab || "sign-in";
  const { user, signIn, signUp, isLoading } = useAuth();
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("learner");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user) {
    const userRole = user.user_metadata?.role;
    const redirectPath = userRole === 'admin' ? '/app/admin' : 
                        userRole === 'contributor' ? '/app/courses' : '/app';
    return <Navigate to={redirectPath} replace />;
  }

  const validateSignIn = () => {
    const newErrors: Record<string, string> = {};
    if (!signInEmail) newErrors.signInEmail = "Email is required";
    if (!signInPassword) newErrors.signInPassword = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};
    if (!signUpEmail) newErrors.signUpEmail = "Email is required";
    if (!signUpPassword) newErrors.signUpPassword = "Password is required";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    if (signUpPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!fullName) newErrors.fullName = "Full name is required";
    if (!role) newErrors.role = "Please select a role";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;

    try {
      await signIn(signInEmail, signInPassword);
    } catch (error: any) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUp()) return;

    try {
      if (signUpEmail === "gamlathrasindu007@gmail.com") {
        toast({
          title: "Restricted Email",
          description: "This email is reserved. Please use the sign in option if you are the administrator.",
          variant: "destructive",
        });
        return;
      }

      // Users with cheating behavior can be removed by admin
      await signUp(signUpEmail, signUpPassword, fullName, role);
      toast({
        title: "Success",
        description: "Registration successful! Please check your email for verification.",
      });
      setAuthMode("sign-in");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="card card-hover animate-fade-in">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="mx-auto w-12 h-12 mb-2">
              <img 
                src="/logo.png" 
                alt="ClassSync Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <CardTitle className="heading-2 text-primary">
            ClassSync
          </CardTitle>
            <CardDescription className="body-base">
              Enterprise Learning Management
          </CardDescription>
        </CardHeader>
        
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "sign-in" | "sign-up")}>
            <TabsList className="grid grid-cols-2 w-full bg-muted rounded-md p-1">
              <TabsTrigger 
                value="sign-in"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="sign-up"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sign-in">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-4">
                  <div className="space-y-1">
                    <Label htmlFor="signin-email" className="form-label">
                      Email Address
                    </Label>
                  <Input
                    id="signin-email"
                    type="email"
                      placeholder="name@company.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                      className={`input-field ${errors.signInEmail ? "input-field-error" : ""}`}
                  />
                  {errors.signInEmail && (
                      <p className="error-message">{errors.signInEmail}</p>
                  )}
                </div>
                
                  <div className="space-y-1">
                    <Label htmlFor="signin-password" className="form-label">
                      Password
                    </Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                        className={`input-field ${errors.signInPassword ? "input-field-error" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors"
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {errors.signInPassword && (
                      <p className="error-message">{errors.signInPassword}</p>
                  )}
                </div>
              </CardContent>
              
                <CardFooter className="pt-2">
                <Button 
                  type="submit" 
                    className="w-full button-primary"
                  disabled={isLoading}
                >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner mr-2" />
                        Authenticating...
                      </div>
                    ) : "Sign In"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="sign-up">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-4">
                  <div className="space-y-1">
                    <Label htmlFor="fullname" className="form-label">
                      Full Name
                    </Label>
                  <Input
                    id="fullname"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                      className={`input-field ${errors.fullName ? "input-field-error" : ""}`}
                  />
                  {errors.fullName && (
                      <p className="error-message">{errors.fullName}</p>
                  )}
                </div>
                
                  <div className="space-y-1">
                    <Label htmlFor="signup-email" className="form-label">
                      Work Email
                    </Label>
                  <Input
                    id="signup-email"
                    type="email"
                      placeholder="name@company.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                      className={`input-field ${errors.signUpEmail ? "input-field-error" : ""}`}
                  />
                  {errors.signUpEmail && (
                      <p className="error-message">{errors.signUpEmail}</p>
                  )}
                </div>
                
                  <div className="space-y-1">
                    <Label htmlFor="signup-password" className="form-label">
                      Password
                    </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                        className={`input-field ${errors.signUpPassword ? "input-field-error" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors"
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {errors.signUpPassword && (
                      <p className="error-message">{errors.signUpPassword}</p>
                  )}
                </div>
                
                  <div className="space-y-1">
                    <Label htmlFor="confirm-password" className="form-label">
                      Confirm Password
                    </Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`input-field ${errors.confirmPassword ? "input-field-error" : ""}`}
                  />
                  {errors.confirmPassword && (
                      <p className="error-message">{errors.confirmPassword}</p>
                  )}
                </div>
                
                  <div className="space-y-1">
                    <Label htmlFor="role" className="form-label">
                      Account Type
                    </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger 
                      id="role"
                        className={`select-trigger ${errors.role ? "input-field-error" : ""}`}
                    >
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                      <SelectContent className="select-content">
                        <SelectItem value="learner" className="select-item">
                          Learner
                        </SelectItem>
                        <SelectItem value="contributor" className="select-item">
                          Contributor
                        </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                      <p className="error-message">{errors.role}</p>
                  )}
                </div>
              </CardContent>
              
                <CardFooter className="pt-2">
                <Button 
                  type="submit" 
                    className="w-full button-primary"
                  disabled={isLoading}
                >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner mr-2" />
                        Creating Account...
                      </div>
                    ) : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      </div>
    </div>
  );
};

export default Auth;
