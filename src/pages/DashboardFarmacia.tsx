import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ActionCard } from "@/components/ui/action-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  QrCode, Users, Pill, History,
  PackageCheck, TrendingUp, Activity, BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { estatisticasApi, receitasApi, MedicamentoRanking, StatusRanking } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const CORES_STATUS: Record<string, string> = {
  ATIVA: "#0F766E",
  DISPENSADA: "#0891B2",
  VENCIDA: "#F59E0B",
  CANCELADA: "#EF4444",
};

const CORES_BARRAS = ["#0891B2", "#0F766E", "#14B8A6", "#0EA5E9", "#6366F1"];

const LABEL_STATUS: Record<string, string> = {
  ATIVA: "Ativas",
  DISPENSADA: "Dispensadas",
  VENCIDA: "Vencidas",
  CANCELADA: "Canceladas",
};

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

const DashboardFarmacia = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [medicamentos, setMedicamentos] = useState<MedicamentoRanking[]>([]);
  const [statusDistribuicao, setStatusDistribuicao] = useState<StatusRanking[]>([]);
  const [dispensacoes, setDispensacoes] = useState({ hoje: 0, mes: 0, total: 0 });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [medsRes, statusRes, histRes] = await Promise.all([
          estatisticasApi.medicamentosMaisReceitados(5),
          estatisticasApi.receitasPorStatus(),
          receitasApi.historicoDispensacoes({ limit: 1 }),
        ]);
        setMedicamentos(medsRes.data.data);
        setStatusDistribuicao(statusRes.data.data);

        const est = (histRes.data as any).data?.estatisticas;
        if (est) {
          setDispensacoes({
            hoje: est.hoje,
            mes: est.mes,
            total: est.total,
          });
        }
      } catch {
        // Falha silenciosa
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const dadosMeds = medicamentos.map((m) => ({
    nome: m.medicamento.length > 18 ? m.medicamento.slice(0, 16) + "..." : m.medicamento,
    total: m.total,
  }));

  const dadosStatus = statusDistribuicao.map((s) => ({
    name: LABEL_STATUS[s.status] ?? s.status,
    value: s.total,
    cor: CORES_STATUS[s.status] ?? "#94A3B8",
  }));

  const nomeFantasia = user?.nome ?? "Farmacia";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* ====== CABECALHO COM SAUDACAO ====== */}
          <div className="animate-fade-in text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Olá, {nomeFantasia}
            </h1>
            <p className="text-muted-foreground mt-1">
              O que deseja fazer hoje?
            </p>
          </div>

          {/* ====== ACOES RAPIDAS (SECAO PRINCIPAL) ====== */}
          <section className="animate-fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground mb-6 text-center">
              Ações rápidas
            </h2>
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
              <ActionCard
                icon={QrCode}
                title="Validar Receita"
                description="Valide e dispense receitas médicas"
                onClick={() => navigate("/farmacia/validar")}
                className="w-full sm:w-64 animate-fade-in"
              />
              <ActionCard
                icon={History}
                title="Historico"
                description="Ver dispensacoes realizadas"
                onClick={() => navigate("/farmacia/historico")}
                className="w-full sm:w-64 animate-fade-in [animation-delay:80ms]"
              />
              <ActionCard
                icon={Users}
                title="Ver Paciente"
                description="Historico medico do paciente"
                onClick={() => navigate("/farmacia/pacientes")}
                className="w-full sm:w-64 animate-fade-in [animation-delay:160ms]"
              />
              <ActionCard
                icon={Pill}
                title="Ver Bula"
                description="Consultar bulas de medicamentos"
                onClick={() => navigate("/farmacia/bulas")}
                className="w-full sm:w-64 animate-fade-in [animation-delay:240ms]"
              />
              <ActionCard
                icon={BarChart2}
                title="Relatorios"
                description="Medicamentos, diagnosticos e graficos de uso"
                onClick={() => navigate("/farmacia/relatorios")}
                className="w-full sm:w-64 animate-fade-in [animation-delay:320ms]"
              />
            </div>
          </section>

          {/* ====== SEPARADOR ====== */}
          <div className="border-t" />

          {/* ====== VISAO GERAL DO SISTEMA (GRAFICOS) ======
            Esta secao aparece abaixo das acoes rapidas como contexto informativo.
          */}
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-6">
              Visão geral do sistema
            </h2>

            {/* Cards de dispensacoes */}
            {carregando ? (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="h-16 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
                <StatCard
                  titulo="Dispensadas hoje"
                  valor={dispensacoes.hoje}
                  descricao="no dia de hoje"
                  icon={PackageCheck}
                  cor="text-teal"
                />
                <StatCard
                  titulo="Dispensadas no mes"
                  valor={dispensacoes.mes}
                  descricao="mes atual"
                  icon={TrendingUp}
                  cor="text-teal"
                />
                <StatCard
                  titulo="Total dispensadas"
                  valor={dispensacoes.total}
                  descricao="desde o inicio"
                  icon={Activity}
                  cor="text-navy"
                />
              </div>
            )}

            {/* Graficos */}
            {!carregando && (dadosMeds.length > 0 || dadosStatus.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">

                {dadosMeds.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">
                        Medicamentos mais receitados (sistema)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dadosMeds} layout="vertical" margin={{ left: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                          <YAxis
                            type="category"
                            dataKey="nome"
                            tick={{ fontSize: 11 }}
                            width={110}
                          />
                          <Tooltip formatter={(v: number) => [v, "Vezes receitado"]} />
                          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                            {dadosMeds.map((_, i) => (
                              <Cell key={i} fill={CORES_BARRAS[i % CORES_BARRAS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {dadosStatus.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">
                        Distribuição de receitas por status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={dadosStatus}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            outerRadius={75}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {dadosStatus.map((entry, i) => (
                              <Cell key={i} fill={entry.cor} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => [v, "Receitas"]} />
                          <Legend />
                        </PieChart>
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

export default DashboardFarmacia;
