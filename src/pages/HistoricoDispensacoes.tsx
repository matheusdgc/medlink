import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Calendar,
  FileText,
  Pill,
  User,
  Stethoscope,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { receitasApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/ui/back-button";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ItemReceita {
  id: string;
  medicamento: string;
  principioAtivo?: string;
  dosagem: string;
  formaFarmaceutica?: string;
  quantidade: number;
  posologia: string;
  observacao?: string;
}

interface Dispensacao {
  id: string;
  dataHora: string;
  observacoes?: string;
  itensDispensados?: Record<
    string,
    { dispensado: boolean; quantidade: number }
  >;
  receita: {
    id: string;
    codigo: string;
    criadaEm: string;
    validadeAte: string;
    diagnostico?: string;
    observacoes?: string;
    itens: ItemReceita[];
    paciente: {
      id: string;
      cpf: string;
      usuario: {
        nome: string;
      };
    };
    medico: {
      crm?: string;
      ufCrm?: string;
      usuario: {
        nome: string;
      };
    };
  };
}

interface Estatisticas {
  hoje: number;
  mes: number;
  total: number;
}

const HistoricoDispensacoes = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dispensacoes, setDispensacoes] = useState<Dispensacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    hoje: 0,
    mes: 0,
    total: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pacienteNome, setPacienteNome] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [dispensacaoSelecionada, setDispensacaoSelecionada] =
    useState<Dispensacao | null>(null);

  const carregarHistorico = async (page = 1) => {
    setLoading(true);
    try {
      const response = await receitasApi.historicoDispensacoes({
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        pacienteNome: pacienteNome || undefined,
        page,
        limit: pagination.limit,
      });

      const data = response.data.data;
      setDispensacoes(data.dispensacoes);
      setPagination(data.pagination);
      setEstatisticas(data.estatisticas);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar histórico",
        description:
          error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const handleFiltrar = () => {
    carregarHistorico(1);
  };

  const handleLimparFiltros = () => {
    setDataInicio("");
    setDataFim("");
    setPacienteNome("");
    carregarHistorico(1);
  };

  const formatarData = (data: string) => {
    return format(parseISO(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatarCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const getItensDispensadosCount = (dispensacao: Dispensacao) => {
    if (!dispensacao.itensDispensados) {
      return dispensacao.receita.itens.length;
    }
    return Object.values(dispensacao.itensDispensados).filter(
      (item) => item.dispensado
    ).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      {/* Hero */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <BackButton to="/farmacia" label="Voltar ao painel da farmacia" />
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Histórico de Dispensações
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualize todas as receitas dispensadas pela farmácia
              </p>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-teal/10 border-teal/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hoje</p>
                    <p className="text-3xl font-bold text-teal">
                      {estatisticas.hoje}
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-teal/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-navy/10 border-navy/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Este Mês</p>
                    <p className="text-3xl font-bold text-navy">
                      {estatisticas.mes}
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-navy/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold text-green-600">
                      {estatisticas.total}
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome do paciente..."
                      value={pacienteNome}
                      onChange={(e) => setPacienteNome(e.target.value)}
                      className="pl-10"
                      onKeyDown={(e) => e.key === "Enter" && handleFiltrar()}
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>

                <Button
                  onClick={handleFiltrar}
                  className="bg-teal hover:bg-teal/90"
                >
                  Buscar
                </Button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Data Início
                    </label>
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-[160px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Data Fim
                    </label>
                    <Input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-[160px]"
                    />
                  </div>

                  <Button variant="ghost" onClick={handleLimparFiltros}>
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabela de Dispensações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal" />
                Dispensações ({pagination.total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Carregando...</p>
                </div>
              ) : dispensacoes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma dispensação encontrada
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Médico</TableHead>
                          <TableHead className="text-center">Itens</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dispensacoes.map((dispensacao) => (
                          <TableRow key={dispensacao.id}>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatarData(dispensacao.dataHora)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {dispensacao.receita.codigo.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {dispensacao.receita.paciente.usuario.nome}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    CPF:{" "}
                                    {formatarCPF(
                                      dispensacao.receita.paciente.cpf
                                    )}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {dispensacao.receita.medico.usuario.nome}
                                  </p>
                                  {dispensacao.receita.medico.crm && (
                                    <p className="text-xs text-muted-foreground">
                                      CRM: {dispensacao.receita.medico.crm}/
                                      {dispensacao.receita.medico.ufCrm}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="gap-1">
                                <Pill className="h-3 w-3" />
                                {getItensDispensadosCount(dispensacao)}/
                                {dispensacao.receita.itens.length}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setDispensacaoSelecionada(dispensacao)
                                }
                              >
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginação */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Página {pagination.page} de {pagination.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => carregarHistorico(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => carregarHistorico(pagination.page + 1)}
                          disabled={pagination.page >= pagination.totalPages}
                        >
                          Próxima
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de Detalhes */}
      <Dialog
        open={!!dispensacaoSelecionada}
        onOpenChange={() => setDispensacaoSelecionada(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal" />
              Detalhes da Dispensação
            </DialogTitle>
          </DialogHeader>

          {dispensacaoSelecionada && (
            <div className="space-y-6">
              {/* Info da Dispensação */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Data/Hora da Dispensação
                    </p>
                    <p className="font-medium">
                      {formatarData(dispensacaoSelecionada.dataHora)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Código da Receita
                    </p>
                    <Badge variant="outline" className="font-mono">
                      {dispensacaoSelecionada.receita.codigo.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Paciente */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-teal" />
                  Paciente
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">
                    {dispensacaoSelecionada.receita.paciente.usuario.nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CPF:{" "}
                    {formatarCPF(dispensacaoSelecionada.receita.paciente.cpf)}
                  </p>
                </div>
              </div>

              {/* Médico */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-teal" />
                  Médico Prescritor
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">
                    {dispensacaoSelecionada.receita.medico.usuario.nome}
                  </p>
                  {dispensacaoSelecionada.receita.medico.crm && (
                    <p className="text-sm text-muted-foreground">
                      CRM: {dispensacaoSelecionada.receita.medico.crm}/
                      {dispensacaoSelecionada.receita.medico.ufCrm}
                    </p>
                  )}
                </div>
              </div>

              {/* Medicamentos */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Pill className="h-4 w-4 text-teal" />
                  Medicamentos Dispensados
                </h4>
                <div className="space-y-2">
                  {dispensacaoSelecionada.receita.itens.map((item) => {
                    const itemDispensado =
                      dispensacaoSelecionada.itensDispensados?.[item.id];
                    const foiDispensado = itemDispensado?.dispensado ?? true;
                    const qtdDispensada =
                      itemDispensado?.quantidade ?? item.quantidade;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border ${
                          foiDispensado
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {item.medicamento}
                              {foiDispensado && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.dosagem}
                              {item.formaFarmaceutica &&
                                ` - ${item.formaFarmaceutica}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.posologia}
                            </p>
                          </div>
                          <Badge
                            variant={foiDispensado ? "default" : "secondary"}
                            className={
                              foiDispensado ? "bg-green-600" : "bg-gray-400"
                            }
                          >
                            {qtdDispensada}/{item.quantidade}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Observações */}
              {dispensacaoSelecionada.observacoes && (
                <div>
                  <h4 className="font-medium mb-2">
                    Observações da Dispensação
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">
                      {dispensacaoSelecionada.observacoes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default HistoricoDispensacoes;
