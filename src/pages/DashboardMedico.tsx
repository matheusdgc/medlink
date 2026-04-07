import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ActionCard } from "@/components/ui/action-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus, FileEdit, Users, Pill,
  ClipboardList, TrendingUp, Activity, BarChart2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { estatisticasApi, MinhasEstatisticas } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const MESES_PT: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

const formatarMes = (mesStr: string) => {
  const [ano, mes] = mesStr.split("-");
  return `${MESES_PT[mes] ?? mes}/${ano.slice(2)}`;
};

const CORES_BARRAS = ["#0F766E", "#14B8A6", "#0D9488", "#0891B2", "#0EA5E9"];

function StatCard({
  titulo,
  valor,
  descricao,
  icon: Icon,
  cor = "text-teal",
}: {
  titulo: string;
  valor: number | string;
  descricao?: string;
  icon: React.ElementType;
  cor?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{titulo}</p>
            <p className={`text-3xl font-bold mt-1 ${cor}`}>{valor}</p>
            {descricao && (
              <p className="text-xs text-muted-foreground mt-1">{descricao}</p>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Icon className={`w-6 h-6 ${cor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const DashboardMedico = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<MinhasEstatisticas | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const res = await estatisticasApi.minhasEstatisticas();
        setStats(res.data.data);
      } catch {
        // Falha silenciosa: os graficos nao aparecem, mas as acoes rapidas sim
      } finally {
        setCarregando(false);
      }
    };
    carregarEstatisticas();
  }, []);

  const dadosGraficoMes = (stats?.receitasPorMes ?? []).map((r) => ({
    mes: formatarMes(r.mes),
    total: r.total,
  }));

  const dadosGraficoMeds = (stats?.medicamentosTop ?? []).map((m) => ({
    nome: m.medicamento.length > 18 ? m.medicamento.slice(0, 16) + "..." : m.medicamento,
    total: m.total,
  }));

  // Exibe o nome completo do medico logado conforme cadastrado no sistema
  const nomeLogado = user?.nome ?? "Doutor(a)";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* ====== CABECALHO COM SAUDACAO ====== */}
          <div className="animate-fade-in text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Ola, {nomeLogado}
            </h1>
            <p className="text-muted-foreground mt-1">
              O que deseja fazer hoje?
            </p>
          </div>

          {/* ====== ACOES RAPIDAS (SECAO PRINCIPAL) ======
            O card de "Relatorios" e incluido aqui, junto com as acoes
            operacionais, para que o usuario acesse tudo a partir de um unico lugar.
            Os graficos de atividade aparecem abaixo, como informacao de contexto.
          */}
          <section className="animate-fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground mb-6 text-center">
              Acoes rapidas
            </h2>
            {/*
              flex-wrap + justify-center: cada linha de cards e centralizada
              individualmente, incluindo a ultima linha quando ela tem menos
              itens do que cabem na largura. CSS Grid nao consegue esse efeito
              sem hacks — flexbox e a solucao correta para este caso.

              Cada ActionCard recebe uma largura fixa (w-64 = 256px) em telas
              medias e grandes, e largura total (w-full) em mobile.
            */}
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
              <ActionCard
                icon={UserPlus}
                title="Criar Receita"
                description="Crie uma nova receita para o paciente"
                onClick={() => navigate("/medico/nova-receita")}
                className="w-full sm:w-64 animate-fade-in"
              />
              <ActionCard
                icon={FileEdit}
                title="Atualizar Receita"
                description="Atualize a data de validade da receita"
                onClick={() => navigate("/medico/atualizar-receita")}
                className="w-full sm:w-64 animate-fade-in [animation-delay:80ms]"
              />
              <ActionCard
                icon={Users}
                title="Ver Paciente"
                description="Historico medico do paciente"
                onClick={() => navigate("/medico/pacientes")}
                className="w-full sm:w-64 animate-fade-in [animation-delay:160ms]"
              />
              <ActionCard
                icon={Pill}
                title="Ver Bula"
                description="Consultar bulas dos medicamentos"
                onClick={() => navigate("/medico/bulas")}
                className="w-full sm:w-64 animate-fade-in [animation-delay:240ms]"
              />
              <ActionCard
                icon={BarChart2}
                title="Relatorios"
                description="Medicamentos, diagnosticos e graficos de uso"
                onClick={() => navigate("/medico/relatorios")}
                className="w-full sm:w-64 animate-fade-in [animation-delay:320ms]"
              />
            </div>
          </section>

          {/* ====== SEPARADOR ====== */}
          <div className="border-t" />

          {/* ====== MINHA ATIVIDADE (GRAFICOS) ======
            Esta secao aparece abaixo das acoes rapidas,
            como complemento informativo — nao como ponto de entrada principal.
          */}
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-6">
              Minha atividade
            </h2>

            {/* Cards de estatisticas — skeleton enquanto carrega */}
            {carregando ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="h-16 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
                <StatCard
                  titulo="Total de Receitas"
                  valor={stats.totalReceitas}
                  descricao="desde o inicio"
                  icon={ClipboardList}
                  cor="text-teal"
                />
                <StatCard
                  titulo="Criadas este mes"
                  valor={stats.receitasMes}
                  descricao="no mes atual"
                  icon={TrendingUp}
                  cor="text-teal"
                />
                <StatCard
                  titulo="Pacientes atendidos"
                  valor={stats.pacientesAtendidos}
                  descricao="pacientes unicos"
                  icon={Users}
                  cor="text-navy"
                />
                <StatCard
                  titulo="Receitas ativas"
                  valor={stats.receitasAtivas}
                  descricao="aguardando dispensacao"
                  icon={Activity}
                  cor="text-emerald-600"
                />
              </div>
            ) : null}

            {/* Graficos lado a lado — so aparecem se houver dados */}
            {stats && dadosGraficoMes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">

                {/* Grafico de area: receitas por mes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Receitas criadas (ultimos 6 meses)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={dadosGraficoMes}>
                        <defs>
                          <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number) => [value, "Receitas"]}
                          labelStyle={{ fontWeight: "bold" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#0F766E"
                          strokeWidth={2}
                          fill="url(#gradTeal)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Grafico de barras: top 5 medicamentos do medico */}
                {dadosGraficoMeds.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">
                        Seus medicamentos mais prescritos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={dadosGraficoMeds}
                          layout="vertical"
                          margin={{ left: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                          <YAxis
                            type="category"
                            dataKey="nome"
                            tick={{ fontSize: 11 }}
                            width={110}
                          />
                          <Tooltip
                            formatter={(value: number) => [value, "Vezes prescrito"]}
                          />
                          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                            {dadosGraficoMeds.map((_, index) => (
                              <Cell key={index} fill={CORES_BARRAS[index % CORES_BARRAS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardMedico;
