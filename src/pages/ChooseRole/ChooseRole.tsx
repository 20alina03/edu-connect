import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const ChooseRole = () => {
  const { roles, role, chooseRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect");

  const options: Array<{ role: AppRole; label: string; subtitle: string; icon: typeof BookOpen }> = [
    { role: "student", label: "Continue as Student", subtitle: "Access student dashboard", icon: BookOpen },
    { role: "teacher", label: "Continue as Teacher", subtitle: "Access teacher dashboard", icon: GraduationCap },
  ].filter((item) => roles.includes(item.role));

  useEffect(() => {
    if (options.length === 1 && role === options[0].role) {
      navigate(options[0].role === "teacher" ? "/dashboard/teacher" : "/dashboard/student", { replace: true });
    }
  }, [navigate, options, role]);

  const handleChoose = (selectedRole: AppRole) => {
    chooseRole(selectedRole);
    if (redirect) {
      navigate(redirect, { replace: true });
      return;
    }

    navigate(selectedRole === "teacher" ? "/dashboard/teacher" : "/dashboard/student", { replace: true });
  };

  return (
    <div className="min-h-screen bg-forest-deep flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.svg" alt="Ilmrise logo" className="h-10 w-auto object-contain" />
          <div>
            <div className="text-xl font-bold font-display">ILMRISE</div>
            <p className="text-sm text-white/50">Choose the dashboard you want to open</p>
          </div>
        </div>

        <div className="grid gap-3">
          {options.map(({ role: optionRole, label, subtitle, icon: Icon }) => (
            <button
              key={optionRole}
              type="button"
              onClick={() => handleChoose(optionRole)}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:border-primary/40 hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{label}</div>
                  <div className="text-sm text-white/50">{subtitle}</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/40" />
            </button>
          ))}
        </div>

        {options.length === 0 && (
          <div className="text-sm text-white/60">No dashboard roles are available for this account.</div>
        )}

        <Button
          variant="ghost"
          className="mt-6 w-full text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => navigate("/login", { replace: true })}
        >
          Back to login
        </Button>
      </div>
    </div>
  );
};

export default ChooseRole;