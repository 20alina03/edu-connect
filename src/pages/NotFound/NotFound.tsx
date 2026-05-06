import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./notfound.css";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="not-found-page">
      <div className="text-center">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-copy">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
