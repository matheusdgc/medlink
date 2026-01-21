import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type UserType = "PACIENTE" | "MEDICO" | "FARMACIA";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes?: UserType[];
}

export function ProtectedRoute({
  children,
  allowedTypes,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check user type permission
  if (allowedTypes && user && !allowedTypes.includes(user.tipo)) {
    // Redirect to appropriate dashboard based on user type
    const dashboardRoutes: Record<UserType, string> = {
      PACIENTE: "/paciente",
      MEDICO: "/medico",
      FARMACIA: "/farmacia",
    };

    return <Navigate to={dashboardRoutes[user.tipo]} replace />;
  }

  return <>{children}</>;
}

// Wrapper for guest-only routes (login pages)
interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Already authenticated - redirect to dashboard
  if (isAuthenticated && user) {
    const dashboardRoutes: Record<UserType, string> = {
      PACIENTE: "/paciente",
      MEDICO: "/medico",
      FARMACIA: "/farmacia",
    };

    return <Navigate to={dashboardRoutes[user.tipo]} replace />;
  }

  return <>{children}</>;
}
