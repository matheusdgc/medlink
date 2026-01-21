import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ActionCard } from "@/components/ui/action-card";
import { QrCode, Users, Pill, History } from "lucide-react";

const DashboardFarmacia = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Painel da Farmácia
            </h1>
            <p className="text-muted-foreground">
              Valide e dispense receitas médicas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <ActionCard
              icon={QrCode}
              title="Validar Receita"
              description="Valide e dispense receitas"
              onClick={() => navigate("/farmacia/validar")}
              className="animate-fade-in"
            />

            <ActionCard
              icon={History}
              title="Histórico"
              description="Ver dispensações realizadas"
              onClick={() => navigate("/farmacia/historico")}
              className="animate-fade-in [animation-delay:100ms]"
            />

            <ActionCard
              icon={Users}
              title="Ver Paciente"
              description="Histórico médico do paciente"
              onClick={() => navigate("/farmacia/pacientes")}
              className="animate-fade-in [animation-delay:200ms]"
            />

            <ActionCard
              icon={Pill}
              title="Ver Bula"
              description="Consultar bulas de medicamentos"
              onClick={() => navigate("/farmacia/bulas")}
              className="animate-fade-in [animation-delay:300ms]"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardFarmacia;
