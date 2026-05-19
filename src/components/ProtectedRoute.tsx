import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";

export const ProtectedRoute = ({
  children,
  requireRole,
  skipRoleCheck = false,
}: {
  children: JSX.Element;
  requireRole?: AppRole;
  skipRoleCheck?: boolean;
}) => {
  const { user, role, roles, loading } = useAuth();
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

  if (!skipRoleCheck && role === null) {
    if (roles.length > 1) {
      return <Navigate to={`/choose-role?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (skipRoleCheck && role === null) {
    return children;
  }

  if (requireRole && role !== requireRole && role !== "admin") {
    return <Navigate to={role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"} replace />;
  }

  return children;
};
