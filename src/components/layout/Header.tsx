import { Link, useLocation, useNavigate } from "react-router-dom";
import { MedLinkLogo } from "@/components/MedLinkLogo";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  variant?: "default" | "transparent";
  showNav?: boolean;
  showProfile?: boolean;
}

const navLinks = [
  { href: "/", label: "Página Inicial" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/contato", label: "Contato" },
];

export const Header = ({
  variant = "default",
  showNav = true,
  showProfile = false,
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Determina a rota do logo baseado no tipo de usuário
  const getLogoRoute = () => {
    if (!isAuthenticated || !user) return "/";
    switch (user.tipo) {
      case "PACIENTE":
        return "/paciente";
      case "MEDICO":
        return "/medico";
      case "FARMACIA":
        return "/farmacia";
      default:
        return "/";
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        variant === "default" && "bg-navy shadow-lg",
        variant === "transparent" && "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to={getLogoRoute()} className="flex items-center">
            <MedLinkLogo variant="white" size="md" />
          </Link>

          {/* Desktop Navigation */}
          {showNav && !isAuthenticated && (
            <nav className="hidden sm:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium text-gray-300 hover:text-white transition-colors",
                    location.pathname === link.href &&
                      "text-white font-semibold"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-4">
            {showProfile && isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full border-2 border-teal bg-transparent hover:bg-teal/20 px-3"
                  >
                    <User className="h-5 w-5 text-teal" />
                    <span className="hidden md:inline text-white text-sm">
                      {user.nome}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.tipo === "MEDICO" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/medico/perfil")}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </DropdownMenuItem>
                  )}
                  {user.tipo === "FARMACIA" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/farmacia/perfil")}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button */}
            {!isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && showNav && !isAuthenticated && (
          <nav className="md:hidden py-4 border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block py-3 text-white/80 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
