import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ActionCard } from "@/components/ui/action-card";
import { UserPlus, FileEdit, Users, Pill } from "lucide-react";

const DashboardMedico = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Painel do Médico
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas receitas e pacientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <ActionCard
              icon={UserPlus}
              title="Criar Receita"
              description="Crie uma nova receita para o paciente"
              onClick={() => navigate("/medico/nova-receita")}
              className="animate-fade-in"
            />

            <ActionCard
              icon={FileEdit}
              title="Atualizar Receita"
              description="Atualize a data da receita"
              onClick={() => navigate("/medico/atualizar-receita")}
              className="animate-fade-in [animation-delay:100ms]"
            />

            <ActionCard
              icon={Users}
              title="Ver Paciente"
              description="Histórico médico do paciente"
              onClick={() => navigate("/medico/pacientes")}
              className="animate-fade-in [animation-delay:200ms]"
            />

            <ActionCard
              icon={Pill}
              title="Ver Bula"
              description="Ver bula dos medicamento"
              onClick={() => navigate("/medico/bulas")}
              className="animate-fade-in [animation-delay:300ms]"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardMedico;
