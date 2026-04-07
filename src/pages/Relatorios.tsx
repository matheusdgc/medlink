import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, RotateCcw, FileDown, FileSpreadsheet } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie, Legend,
} from "recharts";
import {
  estatisticasApi,
  VisaoGeral, ReceitaPorMes, MedicamentoRanking,
  DiagnosticoRanking, StatusRanking,
} from "@/services/api";
import { exportarPdf, exportarExcel } from "@/utils/exportRelatorio";
import { BackButton } from "@/components/ui/back-button";

// ==================== CONSTANTES ====================

const MESES_PT: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

const MESES_OPCOES = [
  { valor: "1", label: "Janeiro" }, { valor: "2", label: "Fevereiro" },
  { valor: "3", label: "Marco" }, { valor: "4", label: "Abril" },
  { valor: "5", label: "Maio" }, { valor: "6", label: "Junho" },
  { valor: "7", label: "Julho" }, { valor: "8", label: "Agosto" },
  { valor: "9", label: "Setembro" }, { valor: "10", label: "Outubro" },
  { valor: "11", label: "Novembro" }, { valor: "12", label: "Dezembro" },
];

const CORES = ["#0F766E", "#1E3A5F", "#14B8A6", "#0891B2", "#0EA5E9", "#6366F1", "#8B5CF6", "#EC4899"];

const CORES_STATUS: Record<string, string> = {
  ATIVA: "#0F766E", DISPENSADA: "#0891B2", VENCIDA: "#F59E0B", CANCELADA: "#EF4444",
};

const LABEL_STATUS: Record<string, string> = {
  ATIVA: "Ativas", DISPENSADA: "Dispensadas", VENCIDA: "Vencidas", CANCELADA: "Canceladas",
};

const formatarMes = (mesStr: string) => {
  const [ano, mes] = mesStr.split("-");
  return `${MESES_PT[mes] ?? mes}/${ano.slice(2)}`;
};

const anoAtual = new Date().getFullYear();
const anosOpcoes = Array.from({ length: 5 }, (_, i) => anoAtual - i);

// ==================== SUBCOMPONENTES ====================

function CardResumo({ titulo, valor, cor = "text-teal" }: { titulo: string; valor: number; cor?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{titulo}</p>
        <p className={`text-2xl font-bold mt-1 ${cor}`}>{valor.toLocaleString("pt-BR")}</p>
      </CardContent>
    </Card>
  );
}

function Skeleton() {
  return <div className="h-64 bg-muted animate-pulse rounded-lg" />;
}

// ==================== PAGINA PRINCIPAL ====================

const Relatorios = () => {
  // Estado da visao geral
  const [visaoGeral, setVisaoGeral] = useState<VisaoGeral | null>(null);
  const [receitasPorMes, setReceitasPorMes] = useState<ReceitaPorMes[]>([]);
  const [statusDistribuicao, setStatusDistribuicao] = useState<StatusRanking[]>([]);

  // Estado da aba medicamentos
  const [medicamentos, setMedicamentos] = useState<MedicamentoRanking[]>([]);

  // Estado da aba diagnosticos
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoRanking[]>([]);
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [buscaDiag, setBuscaDiag] = useState("");
  const [mesDiag, setMesDiag] = useState("");
  const [anoDiag, setAnoDiag] = useState(String(anoAtual));

  // Estado de exportacao
  const [exportandoPdf, setExportandoPdf] = useState(false);
  const [exportandoXlsx, setExportandoXlsx] = useState(false);

  // Carrega tudo em paralelo na montagem
  useEffect(() => {
    const carregar = async () => {
      try {
        const [vgRes, mesesRes, statusRes, medsRes, diagRes] = await Promise.all([
          estatisticasApi.visaoGeral(),
          estatisticasApi.receitasPorMes(6),
          estatisticasApi.receitasPorStatus(),
          estatisticasApi.medicamentosMaisReceitados(10),
          estatisticasApi.diagnosticos({ limite: 10, ano: anoAtual }),
        ]);
        setVisaoGeral(vgRes.data.data);
        setReceitasPorMes(mesesRes.data.data);
        setStatusDistribuicao(statusRes.data.data);
        setMedicamentos(medsRes.data.data);
        setDiagnosticos(diagRes.data.data);
      } catch {
        // Falha silenciosa — pagina continua usavel
      }
    };
    carregar();
  }, []);

  // Busca de diagnosticos com filtros
  const buscarDiagnosticos = useCallback(async () => {
    setLoadingDiag(true);
    try {
      const res = await estatisticasApi.diagnosticos({
        limite: 15,
        busca: buscaDiag || undefined,
        mes: mesDiag ? parseInt(mesDiag) : undefined,
        ano: anoDiag ? parseInt(anoDiag) : undefined,
      });
      setDiagnosticos(res.data.data);
    } catch {
      // silencioso
    } finally {
      setLoadingDiag(false);
    }
  }, [buscaDiag, mesDiag, anoDiag]);

  const limparFiltrosDiag = () => {
    setBuscaDiag("");
    setMesDiag("");
    setAnoDiag(String(anoAtual));
  };

  // ====== HANDLERS DE EXPORTACAO ======

  /**
   * Monta o objeto DadosRelatorio com o estado atual e chama exportarPdf().
   * O filtro de mes/ano do diagnostico e passado para nomear o arquivo gerado.
   */
  const handleExportarPdf = () => {
    setExportandoPdf(true);
    try {
      const mesSelecionado = MESES_OPCOES.find((m) => m.valor === mesDiag)?.label;
      exportarPdf({
        visaoGeral,
        medicamentos,
        diagnosticos,
        statusDistribuicao,
        filtroMes: mesSelecionado,
        filtroAno: anoDiag !== String(anoAtual) ? anoDiag : undefined,
      });
    } finally {
      // Mesmo em erro, libera o botao
      setTimeout(() => setExportandoPdf(false), 1500);
    }
  };

  /**
   * Mesma logica do PDF, mas chama exportarExcel().
   */
  const handleExportarExcel = () => {
    setExportandoXlsx(true);
    try {
      const mesSelecionado = MESES_OPCOES.find((m) => m.valor === mesDiag)?.label;
      exportarExcel({
        visaoGeral,
        medicamentos,
        diagnosticos,
        statusDistribuicao,
        filtroMes: mesSelecionado,
        filtroAno: anoDiag !== String(anoAtual) ? anoDiag : undefined,
      });
    } finally {
      setTimeout(() => setExportandoXlsx(false), 1500);
    }
  };

  // Dados formatados para os graficos
  const dadosMes = receitasPorMes.map((r) => ({
    mes: formatarMes(r.mes),
    total: r.total,
  }));

  const dadosStatus = statusDistribuicao.map((s) => ({
    name: LABEL_STATUS[s.status] ?? s.status,
    value: s.total,
    cor: CORES_STATUS[s.status] ?? "#94A3B8",
  }));

  const dadosMeds = medicamentos.map((m) => ({
    nome: m.medicamento.length > 20 ? m.medicamento.slice(0, 18) + "..." : m.medicamento,
    total: m.total,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* ====== CABECALHO COM BOTOES DE EXPORTACAO ====== */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <BackButton label="Voltar ao painel" />
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Relatorios</h1>
                <p className="text-muted-foreground mt-1">
                  Analise detalhada de uso do sistema MedLink
                </p>
              </div>
            </div>

            {/*
              Botoes de exportacao ficam no cabecalho para que o usuario
              possa exportar os dados atuais (incluindo filtros de diagnostico)
              a qualquer momento, sem precisar rolar a pagina.
            */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleExportarExcel}
                disabled={exportandoXlsx || (!visaoGeral && medicamentos.length === 0)}
                className="flex items-center gap-2 border-teal text-teal hover:bg-teal hover:text-white"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {exportandoXlsx ? "Gerando..." : "Exportar Excel"}
              </Button>
              <Button
                onClick={handleExportarPdf}
                disabled={exportandoPdf || (!visaoGeral && medicamentos.length === 0)}
                className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white"
              >
                <FileDown className="w-4 h-4" />
                {exportandoPdf ? "Gerando..." : "Exportar PDF"}
              </Button>
            </div>
          </div>

          {/* ====== CARDS DE VISAO GERAL ====== */}
          {visaoGeral && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
              <CardResumo titulo="Total de Receitas" valor={visaoGeral.totalReceitas} cor="text-teal" />
              <CardResumo titulo="Total de Pacientes" valor={visaoGeral.totalPacientes} cor="text-navy" />
              <CardResumo titulo="Medicos Cadastrados" valor={visaoGeral.totalMedicos} cor="text-teal" />
              <CardResumo titulo="Dispensacoes" valor={visaoGeral.totalDispensacoes} cor="text-navy" />
            </div>
          )}

          {/* ====== GRAFICOS DE VISAO GERAL ====== */}
          {(dadosMes.length > 0 || dadosStatus.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {dadosMes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Receitas por mes (ultimos 6 meses)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={dadosMes}>
                        <defs>
                          <linearGradient id="gradTealRel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => [v, "Receitas"]} />
                        <Area type="monotone" dataKey="total" stroke="#0F766E" strokeWidth={2} fill="url(#gradTealRel)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {dadosStatus.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Status das receitas</CardTitle>
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
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

          {/* ====== ABAS DE ANALISE DETALHADA ====== */}
          {/*
            Removida a aba "Medicos" conforme solicitado.
            As duas abas restantes sao: Medicamentos e Diagnosticos.
          */}
          <Tabs defaultValue="medicamentos" className="animate-fade-in">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
              <TabsTrigger value="diagnosticos">Diagnosticos</TabsTrigger>
            </TabsList>

            {/* ========== ABA: MEDICAMENTOS ========== */}
            <TabsContent value="medicamentos" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 medicamentos mais receitados</CardTitle>
                </CardHeader>
                <CardContent>
                  {dadosMeds.length === 0 ? (
                    <Skeleton />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={dadosMeds} layout="vertical" margin={{ left: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="nome" tick={{ fontSize: 11 }} width={130} />
                        <Tooltip formatter={(v: number) => [v, "Vezes receitado"]} />
                        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                          {dadosMeds.map((_, i) => (
                            <Cell key={i} fill={CORES[i % CORES.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Tabela complementar */}
              {medicamentos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tabela detalhada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-semibold text-muted-foreground">#</th>
                            <th className="text-left py-2 font-semibold text-muted-foreground">Medicamento</th>
                            <th className="text-right py-2 font-semibold text-muted-foreground">Vezes prescrito</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicamentos.map((m, i) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                              <td className="py-2 text-muted-foreground">{i + 1}</td>
                              <td className="py-2 font-medium">{m.medicamento}</td>
                              <td className="py-2 text-right text-teal font-bold">{m.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ========== ABA: DIAGNOSTICOS ========== */}
            <TabsContent value="diagnosticos" className="mt-6 space-y-6">

              {/* Filtros de busca e periodo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Filtrar diagnosticos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <Label>Busca por diagnostico</Label>
                      <Input
                        placeholder="Ex: diabetes, hipertensao..."
                        value={buscaDiag}
                        onChange={(e) => setBuscaDiag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && buscarDiagnosticos()}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Mes</Label>
                      <Select value={mesDiag} onValueChange={setMesDiag}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          {MESES_OPCOES.map((m) => (
                            <SelectItem key={m.valor} value={m.valor}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Ano</Label>
                      <Select value={anoDiag} onValueChange={setAnoDiag}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {anosOpcoes.map((a) => (
                            <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={buscarDiagnosticos} disabled={loadingDiag} className="bg-navy hover:bg-navy-light text-white">
                      <Search className="w-4 h-4 mr-2" />
                      {loadingDiag ? "Buscando..." : "Buscar"}
                    </Button>
                    <Button variant="outline" onClick={limparFiltrosDiag}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Limpar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resultado: tabela de diagnosticos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Diagnosticos mais frequentes
                    {mesDiag && anoDiag && (
                      <span className="ml-2 text-muted-foreground font-normal">
                        — {MESES_OPCOES.find((m) => m.valor === mesDiag)?.label ?? ""} de {anoDiag}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingDiag ? (
                    <Skeleton />
                  ) : diagnosticos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum diagnostico encontrado para os filtros selecionados.
                    </p>
                  ) : (
                    <>
                      {/* Grafico de barras dos diagnosticos */}
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                          data={diagnosticos.slice(0, 8).map((d) => ({
                            nome: d.diagnostico.length > 20
                              ? d.diagnostico.slice(0, 18) + "..."
                              : d.diagnostico,
                            receitas: d.totalReceitas,
                            pacientes: d.pacientesUnicos,
                          }))}
                          layout="vertical"
                          margin={{ left: 12 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                          <YAxis type="category" dataKey="nome" tick={{ fontSize: 11 }} width={140} />
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              value,
                              name === "receitas" ? "Receitas" : "Pacientes unicos",
                            ]}
                          />
                          <Bar dataKey="receitas" name="receitas" fill="#0F766E" radius={[0, 2, 2, 0]} />
                          <Bar dataKey="pacientes" name="pacientes" fill="#1E3A5F" radius={[0, 2, 2, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Tabela detalhada */}
                      <div className="overflow-x-auto mt-6">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-semibold text-muted-foreground">#</th>
                              <th className="text-left py-2 font-semibold text-muted-foreground">Diagnostico</th>
                              <th className="text-right py-2 font-semibold text-muted-foreground">Receitas</th>
                              <th className="text-right py-2 font-semibold text-muted-foreground">Pacientes unicos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diagnosticos.map((d, i) => (
                              <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="py-2 text-muted-foreground">{i + 1}</td>
                                <td className="py-2 font-medium capitalize">{d.diagnostico}</td>
                                <td className="py-2 text-right text-teal font-bold">{d.totalReceitas}</td>
                                <td className="py-2 text-right text-navy font-bold">{d.pacientesUnicos}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Relatorios;
