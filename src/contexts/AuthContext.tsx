import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "student" | "teacher" | "admin";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (role?: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const applyPendingGoogleRole = async (uid: string, pendingRole: AppRole | null) => {
    if (!pendingRole) return null;

    const { error: roleError } = await supabase.from("user_roles").insert({ user_id: uid, role: pendingRole });
    if (roleError && roleError.code !== "23505") {
      return null;
    }

    if (pendingRole === "teacher") {
      await supabase.from("teacher_profiles").insert({ user_id: uid }).select().maybeSingle();
    }

    localStorage.removeItem("educonnect.pendingRole");
    return pendingRole;
  };

  const fetchRole = async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    const roles = (data ?? []).map((entry) => entry.role as AppRole);
    const orderedRole = roles.find((value) => value === "admin") ?? roles.find((value) => value === "teacher") ?? roles.find((value) => value === "student") ?? null;

    if (orderedRole) {
      setRole(orderedRole);
      localStorage.removeItem("educonnect.pendingRole");
      return;
    }

    const pendingRole = (localStorage.getItem("educonnect.pendingRole") as AppRole | null) ?? null;
    const createdRole = await applyPendingGoogleRole(uid, pendingRole);
    setRole(createdRole ?? "student");
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => fetchRole(sess.user.id), 0);
      } else {
        setRole(null);
      }
    });
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) fetchRole(sess.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp: AuthCtx["signUp"] = async (email, password, fullName, role) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, role },
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async (role: AppRole = "student") => {
    localStorage.setItem("educonnect.pendingRole", role);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword: AuthCtx["resetPassword"] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  return (
    <Ctx.Provider value={{ user, session, role, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
