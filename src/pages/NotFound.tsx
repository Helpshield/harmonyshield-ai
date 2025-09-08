import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-elegant animate-fade-in-up text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Shield className="h-16 w-16 text-primary opacity-50" />
          </div>
          <CardTitle className="text-4xl font-bold text-foreground">404</CardTitle>
          <p className="text-xl text-muted-foreground">Page Not Found</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="hero" className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
