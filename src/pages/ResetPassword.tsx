import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import "./Login/login.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setIsRecovery(true);
  }, []);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Enter your email");
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) return setError(error);
    toast.success("Password reset link sent! Check your email.");
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    toast.success("Password updated!");
    navigate("/dashboard/student");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="login-brand">Edu<span className="text-primary">Connect</span></Link>
        </div>
        <div className="login-card">
          <div className="text-center mb-8">
            <h1 className="login-title">{isRecovery ? "Set new password" : "Reset password"}</h1>
            <p className="login-subtitle">
              {isRecovery ? "Choose a strong new password" : "We'll email you a reset link"}
            </p>
          </div>

          {error && <div className="p-3 mb-6 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm">{error}</div>}

          {isRecovery ? (
            <form onSubmit={handleSetPassword} className="login-form">
              <div className="space-y-2">
                <Label className="login-label">New password</Label>
                <div className="login-input-group">
                  <Lock className="w-5 h-5 text-white/40" />
                  <Input type="password" placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="login-input" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="login-submit-btn">
                {loading ? "Updating..." : "Update password"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSendLink} className="login-form">
              <div className="space-y-2">
                <Label className="login-label">Email</Label>
                <div className="login-input-group">
                  <Mail className="w-5 h-5 text-white/40" />
                  <Input type="email" placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} className="login-input" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="login-submit-btn">
                {loading ? "Sending..." : "Send reset link"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}

          <p className="login-footer">
            <Link to="/login" className="text-primary hover:text-primary-glow font-medium">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
