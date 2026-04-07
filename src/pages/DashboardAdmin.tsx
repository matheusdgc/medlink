import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ActionCard } from "@/components/ui/action-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, FileText, Users, Pill, MapPin, BarChart2,
  ClipboardList, Trash2, CheckSquare, UserCog,
} from "lucide-react";
import { adminApi, AdminResumo } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

function ResumoCard({
  titulo,
  valor,
  cor = "text-teal",
  icon: Icon,
}: {
  titulo: string;
  valor: number | string;
  cor?: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{titulo}</p>
            <p className={`text-3xl font-bold mt-1 ${cor}`}>{valor}</p>
          </div>
          <div className={`p-3 rounded-xl bg-teal/10`}>
            <Icon className="w-6 h-6 text-teal" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumo, setResumo] = useState<AdminResumo | null>(null);
  const [carregando, setCarregando] = useState(true);

  const nomeLogado = user?.nome ?? "Administrador";

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const res = await adminApi.obterResumo();
        setResumo(res.data.data);
      } catch (err) {
        console.error("[DashboardAdmin] Erro ao carregar resumo:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregarResumo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showProfile />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-10">

        {/* Saudacao */}
        <div className="animate-fade-in text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-teal" />
            <span className="text-sm font-medium text-teal uppercase tracking-wider">
              Admin Master
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Ola, {nomeLogado}
          </h1>
          <p className="text-muted-foreground mt-2">
            Acesso completo ao sistema MedLink
          </p>
        </div>

        {/* Resumo numerico */}
        {!carregando && resumo && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-4 text-center">
              Visao Geral do Sistema
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResumoCard
                titulo="Total de Receitas"
                valor={resumo.totalReceitas}
                icon={FileText}
              />
              <ResumoCard
                titulo="Pacientes"
                valor={resumo.totalPacientes}
                icon={Users}
              />
              <ResumoCard
                titulo="Medicos"
                valor={resumo.totalMedicos}
                icon={UserCog}
                cor="text-blue-600"
              />
              <ResumoCard
                titulo="Farmacias"
                valor={resumo.totalFarmacias}
                icon={Pill}
                cor="text-purple-600"
              />
            </div>
          </div>
        )}

        {/* Acoes Rapidas */}
        <div className="animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            Acoes Rapidas
          </h2>

          {/* Secao: Funcionalidades de Medico */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 text-center">
              Modulo Medico
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              <ActionCard
                className="w-full sm:w-64 animate-fade-in"
                title="Nova Receita"
                description="Criar receita medica para um paciente"
                icon={FileText}
                onClick={() => navigate("/medico/nova-receita")}
              />
              <ActionCard
                className="w-full sm:w-64 animate-fade-in"
                title="Ver Pacientes"
                description="Consultar dados e historico dos pacientes"
                icon={Users}
                onClick={() => navigate("/medico/pacientes")}
              />
              <ActionCard
                className="w-full sm:w-64 animate-fade-in"
                title="Bulas de Medicamentos"
                description="Consultar bulas e informacoes farmacologicas"
                icon={Pill}
                onClick={() => navigate("/medico/bulas")}
              />
            </div>
          </div>

          {/* Secao: Funcionalidades de Farmacia */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 text-center">
              Modulo Farmacia
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              <ActionCard
                className="w-full sm:w-64 animate-fade-in"
                title="Validar Receita"
                description="Verificar e dispensar receitas de pacientes"
                icon={CheckSquare}
                onClick={() => navigate("/farmacia/validar")}
              />
              <ActionCard
                className="w-full sm:w-64 animate-fade-in"
                title="Historico de Dispensacoes"
                description="Ver registros de medicamentos entregues"
                icon={ClipboardList}
                onClick={() => navigate("/farmacia/historico")}
              />
            </div>
          </div>

          {/* Secao: Funcionalidades de Paciente */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 text-center">
              Modulo Paciente
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              <ActionCard
                className="w-full sm:w-64 animate-fade-in"
                title="Receitas do Sistema"
                description="Visualizar todas as receitas cadastradas"
                icon={FileText}
                onClick={() => navigate("/paciente/receitas")}
              />
              <ActionCard
                className="w-full sm:w-64 animate-fade-in"
                title="Unidades de Saude"
                description="Gerenciar farmacias e postos de saude"
                icon={MapPin}
                onClick={() => navigate("/admin/unidades-saude")}
              />
            </div>
          </div>

          {/* Secao: Exclusivo Admin */}
          <div>
            <h3 className="text-sm font-medium text-red-500 uppercase tracking-wider mb-4 text-center">
              Administracao — Acesso Restrito
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              <ActionCard
                className="w-full sm:w-64 animate-fade-in border-red-200 hover:border-red-400"
                title="Apagar Receitas"
                description="Remover permanentemente receitas do sistema"
                icon={Trash2}
                onClick={() => navigate("/admin/gerenciar-receitas")}
              />
              <ActionCard
                className="w-full sm:w-64 animate-fade-in"
                title="Relatorios"
                description="Estatisticas, graficos e exportacao de dados do sistema"
                icon={BarChart2}
                onClick={() => navigate("/admin/relatorios")}
              />
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default DashboardAdmin;
