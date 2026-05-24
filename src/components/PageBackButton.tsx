import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface PageBackButtonProps {
  fallbackTo?: string;
  className?: string;
  label?: string;
}

export const PageBackButton = ({ fallbackTo, className, label = "Back" }: PageBackButtonProps) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const fallbackHref = fallbackTo ?? (role === "teacher" ? "/dashboard/teacher" : "/dashboard/student");

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
          return;
        }
        navigate(fallbackHref);
      }}
      className={className ?? "rounded-full shrink-0"}
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> {label}
    </Button>
  );
};
