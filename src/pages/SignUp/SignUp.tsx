import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import "./signup.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    // TODO: Implement actual sign-up logic
    // This is a placeholder for authentication
    setTimeout(() => {
      navigate("/dashboard/student");
      setLoading(false);
    }, 1000);
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    // TODO: Implement Google OAuth sign-up
    // This will be handled by Google Sign-In button
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="signup-page">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/20 blur-3xl opacity-20" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/20 blur-3xl opacity-20" />

      <div className="signup-container">
        <div className="signup-header">
          <Link to="/" className="signup-brand">
            <img src="/logo.svg" alt="EduConnect" className="h-8 w-auto object-contain" />
            Edu<span className="text-primary">Connect</span>
          </Link>
        </div>

        <div className="signup-card">
          <div className="text-center mb-8">
            <h1 className="signup-title">Create your account</h1>
            <p className="signup-subtitle">Join millions learning worldwide</p>
          </div>

          {error && (
            <div className="p-3 mb-6 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="signup-label">
                Full Name
              </Label>
              <div className="signup-input-group">
                <User className="w-5 h-5 text-white/40" />
                <Input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="signup-input"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="signup-label">
                Email Address
              </Label>
              <div className="signup-input-group">
                <Mail className="w-5 h-5 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="signup-input"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="signup-label">
                Password
              </Label>
              <div className="signup-input-group">
                <Lock className="w-5 h-5 text-white/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="signup-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/40 hover:text-white/60 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-white/40">
                At least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="signup-label">
                Confirm Password
              </Label>
              <div className="signup-input-group">
                <Lock className="w-5 h-5 text-white/40" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="signup-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-white/40 hover:text-white/60 transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-xs text-white/60 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link to="#" className="text-primary hover:text-primary-glow">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link to="#" className="text-primary hover:text-primary-glow">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={loading}
              className="signup-submit-btn"
            >
              {loading ? "Creating account..." : "Create Account"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Divider */}
          <div className="signup-divider">
            <span>or sign up with</span>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="signup-google-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign up with Google</span>
          </button>

          {/* Log In Link */}
          <p className="signup-footer">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary-glow transition font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
