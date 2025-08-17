import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Film } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <Film className="h-24 w-24 text-cinema-red mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-lg text-foreground-secondary mb-8">
          Sorry, the page you're looking for doesn't exist. Let's get you back to the movies!
        </p>
        <Link
          to="/"
          className="btn-cinema inline-flex items-center gap-2"
        >
          <Home className="h-5 w-5" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
