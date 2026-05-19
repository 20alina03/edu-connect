import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";

export type AppRole = "student" | "teacher" | "admin";

type SignInResult = {
  error: string | null;
};

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  roles: AppRole[];
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signInWithGoogle: (role?: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  chooseRole: (role: AppRole) => void;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const activeRoleKey = (uid: string) => `ilmrise.activeRole.${uid}`;
  const getAppOrigin = () =>
    typeof window !== "undefined"
      ? window.location.origin
      : import.meta.env.VITE_APP_URL ?? "http://localhost:5173";

  const getRedirectUrl = (redirectPath = "/") =>
    new URL(redirectPath, getAppOrigin()).toString();

  const syncSelectedRole = (uid: string, availableRoles: AppRole[]) => {
    const storedRole = sessionStorage.getItem(activeRoleKey(uid)) as AppRole | null;
    if (storedRole && availableRoles.includes(storedRole)) {
      setRole(storedRole);
      return;
    }
    if (availableRoles.length === 1) {
      setRole(availableRoles[0]);
      sessionStorage.setItem(activeRoleKey(uid), availableRoles[0]);
      return;
    }
    setRole(null);
  };

  const applyPendingGoogleRole = async (uid: string, pendingRole: AppRole | null) => {
    if (!pendingRole) return null;
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: uid, role: pendingRole });
    if (roleError && roleError.code !== "23505") return null;
    if (pendingRole === "teacher") {
      await supabase.from("teacher_profiles").insert({ user_id: uid }).select().maybeSingle();
    }
    localStorage.removeItem("ilmrise.pendingRole");
    return pendingRole;
  };

  const fetchRole = async (uid: string) => {
    const resp = await api.get<{ roles: AppRole[] }>("/auth/me");
    const pendingRole = (localStorage.getItem("ilmrise.pendingRole") as AppRole | null) ?? null;
    let availableRoles: AppRole[] =
      Array.isArray(resp?.roles) && resp.roles.length ? resp.roles : ["student"];

    if (pendingRole) {
      const createdRole = await applyPendingGoogleRole(uid, pendingRole);
      if (createdRole && !availableRoles.includes(createdRole)) {
        availableRoles = [...availableRoles, createdRole];
      }
    }

    setRoles([...new Set(availableRoles)] as AppRole[]);
    syncSelectedRole(uid, availableRoles);

    if (!pendingRole) {
      localStorage.removeItem("ilmrise.pendingRole");
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => { void fetchRole(sess.user.id); }, 0);
      } else {
        setRole(null);
        setRoles([]);
      }
    });
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        void fetchRole(sess.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ✅ FIXED: Call Supabase directly from the frontend instead of going through
  // the Express backend. The Express backend used supabaseAdmin.auth.admin.createUser()
  // which intentionally bypasses the email confirmation flow.
  // Calling supabase.auth.signUp() from the browser is the only way Supabase
  // will trigger the confirmation email through your configured SMTP (Brevo).
  const signUp: AuthCtx["signUp"] = async (email, password, fullName, role) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
          emailRedirectTo: getRedirectUrl("/login"),
        },
      });

      if (error) return { error: error.message };

      // If identities is empty the address is already registered but unconfirmed
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { error: "An account with this email already exists. Please check your inbox for a confirmation email." };
      }

      if (data.user && !data.session) {
        await supabase.auth.resend({
          email,
          type: "signup",
          options: { emailRedirectTo: getRedirectUrl("/login") },
        });
      }

      // Store the role so it can be applied once the user confirms and logs in
      try {
        localStorage.setItem("ilmrise.pendingRole", role);
      } catch {
        // ignore storage errors
      }

      return { error: null };
    } catch (err: any) {
      const msg = err?.message || err?.toString?.() || "Unable to create account";
      return { error: msg };
    }
  };

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message ?? "Unable to sign in" };
    }
  };

  const signInWithGoogle = async (role: AppRole = "student") => {
    localStorage.setItem("ilmrise.pendingRole", role);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getRedirectUrl("/") },
    });
  };

  const signOut = async () => {
    if (user?.id) {
      sessionStorage.removeItem(activeRoleKey(user.id));
    }
    await supabase.auth.signOut();
  };

  const chooseRole = (selectedRole: AppRole) => {
    if (!user?.id) return;
    sessionStorage.setItem(activeRoleKey(user.id), selectedRole);
    setRole(selectedRole);
  };

  const resetPassword: AuthCtx["resetPassword"] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl("/reset-password"),
    });
    return { error: error?.message ?? null };
  };

  return (
    <Ctx.Provider
      value={{ user, session, role, roles, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, chooseRole }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};