import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { receitasApi } from "@/services/api";
import {
  ArrowLeft,
  Search,
  Calendar,
  Loader2,
  Pill,
  User,
  Clock,
  FileText,
  Edit,
  XCircle,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

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

interface Receita {
  id: string;
  codigo: string;
  status: "ATIVA" | "DISPENSADA" | "VENCIDA" | "CANCELADA";
  criadaEm: string;
  validadeAte: string;
  observacoes?: string;
  diagnostico?: string;
  paciente: {
    id: string;
    cpf: string;
    usuario: {
      nome: string;
    };
  };
  medico: {
    id: string;
    crm: string;
    usuario: {
      nome: string;
    };
  };
  itens: ItemReceita[];
  dispensacao?: {
    dataHora: string;
    farmacia: {
      usuario: {
        nome: string;
      };
    };
  };
}

const AtualizarReceita = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("ATIVA");

  const [receitaSelecionada, setReceitaSelecionada] = useState<Receita | null>(
    null
  );
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalRenovar, setModalRenovar] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);

  const [novaValidade, setNovaValidade] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarReceitas();
  }, [filtroStatus]);

  const carregarReceitas = async () => {
    try {
      setLoading(true);
      const response = await receitasApi.listar({
        status: filtroStatus || undefined,
      });
      setReceitas(response.data.data.receitas);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar receitas",
        description:
          error.response?.data?.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const receitasFiltradas = receitas.filter((receita) => {
    if (!busca) return true;
    const termoBusca = busca.toLowerCase();
    return (
      receita.codigo.toLowerCase().includes(termoBusca) ||
      receita.paciente.usuario.nome.toLowerCase().includes(termoBusca) ||
      receita.paciente.cpf.includes(busca)
    );
  });

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString("pt-BR");
  };

  const formatarDataHora = (dataString: string) => {
    return new Date(dataString).toLocaleString("pt-BR");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      ATIVA: { label: "Ativa", variant: "default" },
      DISPENSADA: { label: "Dispensada", variant: "secondary" },
      VENCIDA: { label: "Vencida", variant: "outline" },
      CANCELADA: { label: "Cancelada", variant: "destructive" },
    };
    const config = statusConfig[status] || {
      label: status,
      variant: "outline" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const abrirDetalhes = (receita: Receita) => {
    setReceitaSelecionada(receita);
    setModalDetalhes(true);
  };

  const abrirRenovar = (receita: Receita) => {
    setReceitaSelecionada(receita);
    // Default: adiciona 30 dias à data atual
    const novaData = new Date();
    novaData.setDate(novaData.getDate() + 30);
    setNovaValidade(novaData.toISOString().split("T")[0]);
    setModalRenovar(true);
  };

  const abrirCancelar = (receita: Receita) => {
    setReceitaSelecionada(receita);
    setModalCancelar(true);
  };

  const handleRenovar = async () => {
    if (!receitaSelecionada || !novaValidade) return;

    try {
      setSalvando(true);
      await receitasApi.renovar(receitaSelecionada.id, novaValidade);

      toast({
        title: "Receita renovada!",
        description: `A validade foi estendida até ${formatarData(
          novaValidade
        )}`,
      });

      setModalRenovar(false);
      setReceitaSelecionada(null);
      carregarReceitas();
    } catch (error: any) {
      toast({
        title: "Erro ao renovar receita",
        description: error.response?.data?.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = async () => {
    if (!receitaSelecionada) return;

    try {
      setSalvando(true);
      await receitasApi.cancelar(receitaSelecionada.id);

      toast({
        title: "Receita cancelada",
        description: "A receita foi cancelada com sucesso",
      });

      setModalCancelar(false);
      setReceitaSelecionada(null);
      carregarReceitas();
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar receita",
        description: error.response?.data?.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const isReceitaEditavel = (receita: Receita) => {
    return receita.status === "ATIVA";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/medico")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Atualizar Receita
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas receitas emitidas
              </p>
            </div>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, paciente ou CPF..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro de status */}
                <div className="flex gap-2">
                  {["ATIVA", "DISPENSADA", "VENCIDA", "CANCELADA", ""].map(
                    (status) => (
                      <Button
                        key={status || "todas"}
                        variant={
                          filtroStatus === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setFiltroStatus(status)}
                        className={
                          filtroStatus === status
                            ? "bg-navy hover:bg-navy-light"
                            : ""
                        }
                      >
                        {status || "Todas"}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Receitas */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
            </div>
          ) : receitasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  {busca
                    ? "Nenhuma receita encontrada para esta busca"
                    : "Você ainda não tem receitas emitidas"}
                </p>
                <Button
                  onClick={() => navigate("/medico/nova-receita")}
                  className="mt-4 bg-navy hover:bg-navy-light"
                >
                  Criar Nova Receita
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {receitasFiltradas.map((receita) => (
                <Card
                  key={receita.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Info Principal */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {receita.codigo}
                          </span>
                          {getStatusBadge(receita.status)}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {receita.paciente.usuario.nome}
                          </span>
                          <span className="text-muted-foreground">
                            (CPF: {receita.paciente.cpf})
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Emitida: {formatarData(receita.criadaEm)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Validade: {formatarData(receita.validadeAte)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Pill className="h-3 w-3" />
                            {receita.itens.length} medicamento(s)
                          </div>
                        </div>

                        {receita.dispensacao && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Dispensada em{" "}
                            {formatarDataHora(
                              receita.dispensacao.dataHora
                            )} por {receita.dispensacao.farmacia.usuario.nome}
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirDetalhes(receita)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>

                        {isReceitaEditavel(receita) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirRenovar(receita)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Renovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirCancelar(receita)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal de Detalhes */}
      <Dialog open={modalDetalhes} onOpenChange={setModalDetalhes}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes da Receita
            </DialogTitle>
            <DialogDescription>
              Código: {receitaSelecionada?.codigo}
            </DialogDescription>
          </DialogHeader>

          {receitaSelecionada && (
            <div className="space-y-4">
              {/* Info do Paciente */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {receitaSelecionada.paciente.usuario.nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CPF: {receitaSelecionada.paciente.cpf}
                  </p>
                </CardContent>
              </Card>

              {/* Status e Datas */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    {getStatusBadge(receitaSelecionada.status)}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Validade
                    </p>
                    <p className="font-medium">
                      {formatarData(receitaSelecionada.validadeAte)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Diagnóstico */}
              {receitaSelecionada.diagnostico && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Diagnóstico / CID
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{receitaSelecionada.diagnostico}</p>
                  </CardContent>
                </Card>
              )}

              {/* Medicamentos */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Medicamentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {receitaSelecionada.itens.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3 bg-muted/50 rounded-lg space-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {index + 1}. {item.medicamento}
                          </p>
                          {item.principioAtivo && (
                            <p className="text-sm text-muted-foreground">
                              ({item.principioAtivo})
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {item.quantidade} {item.formaFarmaceutica || "un"}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        <strong>Dosagem:</strong> {item.dosagem}
                      </p>
                      <p className="text-sm">
                        <strong>Posologia:</strong> {item.posologia}
                      </p>
                      {item.observacao && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Obs:</strong> {item.observacao}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Observações */}
              {receitaSelecionada.observacoes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Observações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{receitaSelecionada.observacoes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Info de Dispensação */}
              {receitaSelecionada.dispensacao && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-700">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Dispensação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Dispensada em{" "}
                      {formatarDataHora(
                        receitaSelecionada.dispensacao.dataHora
                      )}
                    </p>
                    <p className="text-sm">
                      Por:{" "}
                      {receitaSelecionada.dispensacao.farmacia.usuario.nome}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDetalhes(false)}>
              Fechar
            </Button>
            {receitaSelecionada && isReceitaEditavel(receitaSelecionada) && (
              <>
                <Button
                  onClick={() => {
                    setModalDetalhes(false);
                    abrirRenovar(receitaSelecionada);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Renovar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setModalDetalhes(false);
                    abrirCancelar(receitaSelecionada);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Renovar */}
      <Dialog open={modalRenovar} onOpenChange={setModalRenovar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Renovar Receita
            </DialogTitle>
            <DialogDescription>
              Estenda a validade da receita {receitaSelecionada?.codigo}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Paciente</p>
              <p className="font-medium">
                {receitaSelecionada?.paciente.usuario.nome}
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Validade Atual</p>
              <p className="font-medium">
                {receitaSelecionada &&
                  formatarData(receitaSelecionada.validadeAte)}
              </p>
            </div>

            <div>
              <Label htmlFor="novaValidade">Nova Data de Validade</Label>
              <Input
                id="novaValidade"
                type="date"
                value={novaValidade}
                onChange={(e) => setNovaValidade(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalRenovar(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRenovar}
              disabled={salvando || !novaValidade}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Renovando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Confirmar Renovação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert de Cancelar */}
      <AlertDialog open={modalCancelar} onOpenChange={setModalCancelar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cancelar Receita
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a cancelar a receita{" "}
              <strong>{receitaSelecionada?.codigo}</strong> do paciente{" "}
              <strong>{receitaSelecionada?.paciente.usuario.nome}</strong>.
              <br />
              <br />
              Esta ação não pode ser desfeita. A receita não poderá mais ser
              utilizada pelo paciente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={salvando}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelar}
              disabled={salvando}
              className="bg-red-600 hover:bg-red-700"
            >
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelando...
                </>
              ) : (
                "Sim, Cancelar Receita"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AtualizarReceita;
