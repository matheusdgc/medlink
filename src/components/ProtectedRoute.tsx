import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type UserType = "PACIENTE" | "MEDICO" | "FARMACIA" | "ADMIN";

// Mapa centralizado de tipo de usuario -> rota do dashboard.
// Usado em ProtectedRoute (redireciona usuario com tipo errado) e
// em GuestRoute (redireciona usuario ja autenticado ao tentar acessar login).
const dashboardRoutes: Record<UserType, string> = {
  PACIENTE: "/paciente",
  MEDICO: "/medico",
  FARMACIA: "/farmacia",
  ADMIN: "/admin",
};

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

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

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedTypes && user && !allowedTypes.includes(user.tipo)) {
    return <Navigate to={dashboardRoutes[user.tipo]} replace />;
  }

  return <>{children}</>;
}

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated && user) {
    return <Navigate to={dashboardRoutes[user.tipo]} replace />;
  }

  return <>{children}</>;
}
