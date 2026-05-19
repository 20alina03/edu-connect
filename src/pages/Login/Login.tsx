import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect");
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Please fill in all fields");
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      const msg = String(result.error).toLowerCase();
      // detect unconfirmed-email cases and show banner with resend option
      if (msg.includes("confirm") || msg.includes("activate") || msg.includes("verify") || msg.includes("not confirmed") || msg.includes("already registered")) {
        setUnconfirmedEmail(email);
      }

      return setError(result.error);
    }

    toast.success("Welcome back!");
    navigate(redirect || "/dashboard");
  };

  return (
    <div className="login-page">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/20 blur-3xl opacity-20" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/20 blur-3xl opacity-20" />

      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="login-brand relative inline-flex items-center gap-3 overflow-visible">
            <img
              src="/logo.svg"
              alt="Ilmrise logo"
              className="absolute left-0 top-1/2 h-12 w-auto -translate-y-1/2 opacity-20 pointer-events-none select-none"
              aria-hidden="true"
            />
            <span className="relative pl-10">ILMRISE</span>
          </Link>
        </div>

        <div className="login-card">
          <div className="text-center mb-6">
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Sign in with your email and password</p>
          </div>

          {error && (
            <div className="p-3 mb-6 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="login-label">Email Address</Label>
              <div className="login-input-group">
                <Mail className="w-5 h-5 text-white/40" />
                <Input id="email" type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="login-input" required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="login-label">Password</Label>
                <Link to="/reset-password" className="text-xs text-primary hover:text-primary-glow transition">
                  Forgot password?
                </Link>
              </div>
              <div className="login-input-group">
                <Lock className="w-5 h-5 text-white/40" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/40 hover:text-white/60 transition">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="login-submit-btn">
              {loading ? "Signing in..." : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {unconfirmedEmail && (
            <div className="p-3 mt-4 rounded-lg bg-yellow-500/10 border border-yellow-500 text-yellow-300 text-sm flex items-center justify-between">
              <div>Please confirm your email address to sign in.</div>
              <button
                onClick={async () => {
                  try {
                    await supabase.auth.resend({ email: unconfirmedEmail, type: "signup", options: { emailRedirectTo: `${window.location.origin}/login` } });
                    toast.success("Confirmation email resent. Check your inbox.");
                  } catch (err) {
                    toast.error("Unable to resend confirmation. Try again later.");
                  }
                }}
                className="ml-3 text-sm underline"
              >
                Resend
              </button>
            </div>
          )}

          <div className="login-divider"><span>or continue with</span></div>

          <button onClick={() => signInWithGoogle()} disabled={loading} className="login-google-btn">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Login with Google</span>
          </button>

          <p className="login-footer">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary-glow transition font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
