import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";

export const ProtectedRoute = ({
  children,
  requireRole,
}: {
  children: JSX.Element;
  requireRole?: AppRole;
}) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (requireRole && role !== requireRole && role !== "admin") {
    return <Navigate to={role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"} replace />;
  }

  return children;
};
