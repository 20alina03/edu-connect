import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "./signup.css";

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const [role, setRole] = useState<AppRole>("student");
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword)
      return "Please fill in all fields";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!agreedToTerms) return "Please agree to the terms and conditions";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const v = validateForm();
    if (v) return setError(v);
    setLoading(true);
    // store pending role so we can apply it after email confirmation
    try {
      localStorage.setItem("ilmrise.pendingRole", role);
    } catch (err) {
      // ignore storage errors
    }
    const { error } = await signUp(formData.email, formData.password, formData.fullName, role);
    setLoading(false);
    if (error) {
      // If the user already exists, resend the confirmation email
      const msg = String(error).toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        try {
          await supabase.auth.resend({ email: formData.email, type: "signup", options: { emailRedirectTo: `${window.location.origin}/login` } });
          toast.success("Confirmation email resent. Check your email to confirm the teacher account.");
          navigate("/login");
          return;
        } catch (err) {
          return setError("Account exists but we couldn't resend confirmation. Please contact support.");
        }
      }

      return setError(error);
    }

    toast.success("Account created. Check your email to confirm your account.");
    navigate("/login");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="signup-page">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/20 blur-3xl opacity-20" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/20 blur-3xl opacity-20" />

      <div className="signup-container">
        <div className="signup-header">
          <Link to="/" className="signup-brand">
            Edu<span className="text-primary">Connect</span>
          </Link>
        </div>

        <div className="signup-card">
          <div className="text-center mb-6">
            <h1 className="signup-title">Create your account</h1>
            <p className="signup-subtitle">Join thousands learning worldwide</p>
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="role" className="signup-label">Account type</Label>
            <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
              <SelectTrigger id="role" className="signup-input-group w-full">
                <SelectValue placeholder="Choose account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Student</span>
                  </div>
                </SelectItem>
                <SelectItem value="teacher">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Teacher</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-3 mb-6 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="signup-label">Full Name</Label>
              <div className="signup-input-group">
                <User className="w-5 h-5 text-white/40" />
                <Input id="fullName" type="text" name="fullName" placeholder="Your full name"
                  value={formData.fullName} onChange={handleInputChange} className="signup-input" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="signup-label">Email Address</Label>
              <div className="signup-input-group">
                <Mail className="w-5 h-5 text-white/40" />
                <Input id="email" type="email" name="email" placeholder="your@email.com"
                  value={formData.email} onChange={handleInputChange} className="signup-input" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="signup-label">Password</Label>
              <div className="signup-input-group">
                <Lock className="w-5 h-5 text-white/40" />
                <Input id="password" type={showPassword ? "text" : "password"} name="password" placeholder="••••••••"
                  value={formData.password} onChange={handleInputChange} className="signup-input" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/40 hover:text-white/60 transition">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-white/40">At least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="signup-label">Confirm Password</Label>
              <div className="signup-input-group">
                <Lock className="w-5 h-5 text-white/40" />
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                  placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange}
                  className="signup-input" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-white/40 hover:text-white/60 transition">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <Checkbox id="terms" checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} className="mt-1" />
              <label htmlFor="terms" className="text-xs text-white/60 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link to="#" className="text-primary hover:text-primary-glow">Terms of Service</Link> and{" "}
                <Link to="#" className="text-primary hover:text-primary-glow">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" disabled={loading} className="signup-submit-btn">
              {loading ? "Creating account..." : `Create ${role === "teacher" ? "Teacher" : "Student"} Account`}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="signup-divider"><span>or sign up with</span></div>

          <button onClick={() => signInWithGoogle(role)} disabled={loading} className="signup-google-btn">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign up with Google</span>
          </button>

          <p className="signup-footer">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary-glow transition font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
