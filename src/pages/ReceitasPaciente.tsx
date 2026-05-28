import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/ui/back-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  Search,
  Calendar,
  User,
  Pill,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { pacientesApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { exportarReceitaPdf } from "@/utils/exportarReceita";

type ReceitaStatus = "ATIVA" | "DISPENSADA" | "VENCIDA" | "CANCELADA";

interface ReceitaItem {
  id: string;
  medicamento: string;
  principioAtivo: string | null;
  dosagem: string;
  formaFarmaceutica: string | null;
  quantidade: number;
  posologia: string;
  observacao: string | null;
}

interface Receita {
  id: string;
  codigo: string;
  status: ReceitaStatus;
  criadaEm: string;
  validadeAte: string;
  observacoes: string | null;
  diagnostico: string | null;
  dispensadaEm: string | null;
  medico: {
    id: string;
    crm: string;
    ufCrm: string;
    especialidade: string | null;
    usuario: {
      nome: string;
    };
  };
  itens: ReceitaItem[];
  dispensacao?: {
    dispensadaEm: string;
    observacoes: string | null;
    farmacia: {
      usuario: {
        nome: string;
      };
    };
  } | null;
}

const statusConfig: Record<
  ReceitaStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  ATIVA: {
    label: "Ativa",
    className: "bg-teal text-white",
    icon: <Clock className="w-3 h-3" />,
  },
  DISPENSADA: {
    label: "Dispensada",
    className: "bg-blue-500 text-white",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  VENCIDA: {
    label: "Vencida",
    className: "bg-red-500 text-white",
    icon: <XCircle className="w-3 h-3" />,
  },
  CANCELADA: {
    label: "Cancelada",
    className: "bg-gray-500 text-white",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const ReceitasPaciente = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<ReceitaStatus | "todas">("todas");
  const [busca, setBusca] = useState("");
  const [receitaSelecionada, setReceitaSelecionada] = useState<Receita | null>(
    null
  );
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    carregarReceitas();
  }, []);

  const carregarReceitas = async () => {
    setIsLoading(true);
    try {
      const response = await pacientesApi.meuPerfil();
      setReceitas(response.data.data.receitas || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar receitas",
        description:
          error.response?.data?.message ||
          "Não foi possível carregar suas receitas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copiarCodigo = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      toast({
        title: "Código copiado!",
        description:
          "O código da receita foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatarDataHora = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const receitasFiltradas = receitas
    .filter((r) => filtro === "todas" || r.status === filtro)
    .filter((r) => {
      if (!busca) return true;
      const termoBusca = busca.toLowerCase();
      return (
        r.codigo.toLowerCase().includes(termoBusca) ||
        r.medico.usuario.nome.toLowerCase().includes(termoBusca) ||
        r.itens.some((item) =>
          item.medicamento.toLowerCase().includes(termoBusca)
        )
      );
    });

  const contadores = {
    todas: receitas.length,
    ATIVA: receitas.filter((r) => r.status === "ATIVA").length,
    DISPENSADA: receitas.filter((r) => r.status === "DISPENSADA").length,
    VENCIDA: receitas.filter((r) => r.status === "VENCIDA").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <BackButton to="/" label="Voltar ao início" />
          <div>
            <h1 className="text-2xl font-display font-bold text-navy">
              Minhas Receitas
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Consulte suas receitas médicas emitidas
            </p>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por código, médico ou medicamento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["todas", "ATIVA", "DISPENSADA", "VENCIDA"] as const).map(
            (status) => (
              <Button
                key={status}
                variant={filtro === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltro(status)}
                className={
                  filtro === status
                    ? "bg-teal hover:bg-teal-dark text-white"
                    : "border-border text-muted-foreground"
                }
              >
                {status === "todas" ? "Todas" : statusConfig[status].label}
                <span className="ml-1 text-xs opacity-70">
                  ({contadores[status]})
                </span>
              </Button>
            )
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div>
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Lista de Receitas */}
        {!isLoading && (
          <div className="space-y-4">
            {receitasFiltradas.map((receita, index) => (
              <Card
                key={receita.id}
                className="animate-fade-in cursor-pointer hover:shadow-card transition-shadow"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setReceitaSelecionada(receita)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-light flex items-center justify-center">
                        <FileText className="w-5 h-5 text-teal" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {receita.itens.length === 1
                            ? receita.itens[0].medicamento
                            : `${receita.itens.length} medicamentos`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Código: {receita.codigo.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        statusConfig[receita.status].className
                      } flex items-center gap-1`}
                    >
                      {statusConfig[receita.status].icon}
                      {statusConfig[receita.status].label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Dr(a). {receita.medico.usuario.nome}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatarData(receita.criadaEm)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && receitasFiltradas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Nenhuma receita encontrada</p>
            <p className="text-sm mt-1">
              {busca
                ? "Tente outro termo de busca"
                : "Você ainda não possui receitas"}
            </p>
          </div>
        )}
      </main>

      {/* Dialog de detalhes da receita */}
      <Dialog
        open={!!receitaSelecionada}
        onOpenChange={() => setReceitaSelecionada(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal" />
              Detalhes da Receita
            </DialogTitle>
          </DialogHeader>

          {receitaSelecionada && (
            <div className="space-y-6">
              {/* Status e Código */}
              <div className="flex items-center justify-between">
                <Badge
                  className={`${
                    statusConfig[receitaSelecionada.status].className
                  } flex items-center gap-1`}
                >
                  {statusConfig[receitaSelecionada.status].icon}
                  {statusConfig[receitaSelecionada.status].label}
                </Badge>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {receitaSelecionada.codigo}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copiarCodigo(receitaSelecionada.codigo)}
                  >
                    {copiado ? (
                      <Check className="w-4 h-4 text-teal" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  {/* Botao de download do PDF da receita individual.
                      Gera um documento com QR Code, dados do medico, paciente
                      e medicamentos — pronto para apresentar na farmacia. */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-teal border-teal hover:bg-teal hover:text-white"
                    onClick={() =>
                      exportarReceitaPdf(receitaSelecionada, user?.nome ?? "Paciente")
                    }
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </Button>
                </div>
              </div>

              {/* Informações do médico */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm text-gray-500 mb-2">
                    Médico Prescritor
                  </h4>
                  <p className="font-semibold">
                    Dr(a). {receitaSelecionada.medico.usuario.nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CRM: {receitaSelecionada.medico.crm}/
                    {receitaSelecionada.medico.ufCrm}
                    {receitaSelecionada.medico.especialidade &&
                      ` • ${receitaSelecionada.medico.especialidade}`}
                  </p>
                </CardContent>
              </Card>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm text-gray-500 mb-1">
                      Emitida em
                    </h4>
                    <p className="font-semibold">
                      {formatarData(receitaSelecionada.criadaEm)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm text-gray-500 mb-1">
                      Válida até
                    </h4>
                    <p className="font-semibold">
                      {formatarData(receitaSelecionada.validadeAte)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Diagnóstico */}
              {receitaSelecionada.diagnostico && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm text-gray-500 mb-2">
                      Diagnóstico / Indicação
                    </h4>
                    <p>{receitaSelecionada.diagnostico}</p>
                  </CardContent>
                </Card>
              )}

              {/* Medicamentos */}
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Medicamentos Prescritos
                </h4>
                <div className="space-y-3">
                  {receitaSelecionada.itens.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{item.medicamento}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.dosagem}
                              {item.formaFarmaceutica &&
                                ` - ${item.formaFarmaceutica}`}
                            </p>
                          </div>
                          <Badge variant="outline">
                            Qtd: {item.quantidade}
                          </Badge>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm">
                            <span className="font-medium">Posologia:</span>{" "}
                            {item.posologia}
                          </p>
                          {item.observacao && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">Obs:</span>{" "}
                              {item.observacao}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Observações */}
              {receitaSelecionada.observacoes && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm text-gray-500 mb-2">
                      Observações do Médico
                    </h4>
                    <p className="text-sm">{receitaSelecionada.observacoes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Dispensação */}
              {receitaSelecionada.dispensacao && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm text-blue-700 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Informações da Dispensação
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Dispensada em:</span>{" "}
                        {formatarDataHora(
                          receitaSelecionada.dispensacao.dispensadaEm
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Farmácia:</span>{" "}
                        {receitaSelecionada.dispensacao.farmacia.usuario.nome}
                      </p>
                      {receitaSelecionada.dispensacao.observacoes && (
                        <p>
                          <span className="font-medium">Observações:</span>{" "}
                          {receitaSelecionada.dispensacao.observacoes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Instruções para o paciente */}
              {receitaSelecionada.status === "ATIVA" && (
                <Card className="border-teal bg-teal-light">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm text-teal mb-2">
                      Como retirar seus medicamentos
                    </h4>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                      <li>
                        Vá até uma farmácia credenciada ou unidade de saúde
                      </li>
                      <li>Informe o código da receita ou apresente seu CPF</li>
                      <li>O farmacêutico irá dispensar seus medicamentos</li>
                    </ol>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ReceitasPaciente;
