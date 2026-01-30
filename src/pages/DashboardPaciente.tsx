import { useNavigate } from "react-router-dom";
import { MedLinkLogo } from "@/components/MedLinkLogo";
import { Footer } from "@/components/layout/Footer";
import { ActionCard } from "@/components/ui/action-card";
import { FileText, MapPin, Pill, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardPaciente = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-navy text-white p-4 flex items-center justify-between">
        <MedLinkLogo variant="white" size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80 hidden sm:block">
            {user?.nome?.split(" ")[0]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {menuOpen && (
        <div className="bg-navy text-white px-4 pb-4 animate-slide-in">
          <nav className="space-y-2">
            <div className="py-2 px-3 border-b border-white/20 mb-2">
              <p className="text-sm text-white/60">Olá,</p>
              <p className="font-medium">{user?.nome}</p>
            </div>
            <button
              onClick={() => navigate("/paciente/receitas")}
              className="block w-full text-left py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Minhas Receitas
            </button>
            <button
              onClick={() => navigate("/paciente/unidades")}
              className="block w-full text-left py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Unidades de Saúde
            </button>
            <button
              onClick={() => navigate("/paciente/bulas")}
              className="block w-full text-left py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Bulas
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg text-red-300 hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display text-2xl font-bold text-foreground text-center mb-8 animate-fade-in">
            Clique onde deseja ir
          </h1>

          <div className="space-y-6">
            <ActionCard
              icon={FileText}
              title="Visualizar Receita"
              description="Visualize suas receitas"
              onClick={() => navigate("/paciente/receitas")}
              className="w-full animate-fade-in"
            />

            <ActionCard
              icon={MapPin}
              title="Ver Unidade de Saúde"
              description="Veja onde sua receita foi expedida"
              onClick={() => navigate("/paciente/unidades")}
              className="w-full animate-fade-in [animation-delay:100ms]"
            />

            <ActionCard
              icon={Pill}
              title="Ver Bula"
              description="Ver bula dos medicamento"
              onClick={() => navigate("/paciente/bulas")}
              className="w-full animate-fade-in [animation-delay:200ms]"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPaciente;
