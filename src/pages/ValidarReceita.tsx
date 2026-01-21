import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Search,
  QrCode,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Stethoscope,
  Pill,
  Calendar,
  Clock,
  CreditCard,
  FileText,
} from "lucide-react";
import { receitasApi, pacientesApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface ItemDispensado {
  itemReceitaId: string;
  medicamentoEntregue: string;
  quantidadeEntregue: string;
  observacao: string;
}

interface Receita {
  id: string;
  codigo: string;
  status: string;
  criadoEm: string;
  validadeAte: string;
  observacoes: string | null;
  diagnostico: string | null;
  dispensadoEm: string | null;
  paciente: {
    id: string;
    cpf: string;
    cartaoSus: string | null;
    dataNascimento: string;
    usuario: {
      nome: string;
      email: string;
    };
  };
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
}

const ValidarReceita = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [codigoReceita, setCodigoReceita] = useState("");
  const [cpfPaciente, setCpfPaciente] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCpf, setIsLoadingCpf] = useState(false);
  const [receita, setReceita] = useState<Receita | null>(null);
  const [receitasPaciente, setReceitasPaciente] = useState<Receita[]>([]);
  const [pacienteNome, setPacienteNome] = useState("");
  const [observacoesDispensacao, setObservacoesDispensacao] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDispensando, setIsDispensando] = useState(false);
  const [activeTab, setActiveTab] = useState("codigo");
  const [itensDispensados, setItensDispensados] = useState<ItemDispensado[]>(
    []
  );

  // Inicializar itens dispensados quando uma receita é carregada
  const inicializarItensDispensados = (receitaCarregada: Receita) => {
    const itens = receitaCarregada.itens.map((item) => ({
      itemReceitaId: item.id,
      medicamentoEntregue: `${item.medicamento} ${item.dosagem}${
        item.formaFarmaceutica ? ` - ${item.formaFarmaceutica}` : ""
      }`,
      quantidadeEntregue: String(item.quantidade),
      observacao: "",
    }));
    setItensDispensados(itens);
  };

  const atualizarItemDispensado = (
    itemReceitaId: string,
    campo: keyof ItemDispensado,
    valor: string
  ) => {
    setItensDispensados((prev) =>
      prev.map((item) =>
        item.itemReceitaId === itemReceitaId
          ? { ...item, [campo]: valor }
          : item
      )
    );
  };

  const formatarCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatarCpf(value);
    setCpfPaciente(formatted);
  };

  const buscarReceita = async () => {
    if (!codigoReceita.trim()) {
      toast({
        title: "Erro",
        description: "Digite o código da receita",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setReceita(null);
    setReceitasPaciente([]);

    try {
      const response = await receitasApi.buscarPorCodigo(codigoReceita.trim());
      const receitaCarregada = response.data.data;
      setReceita(receitaCarregada);
      inicializarItensDispensados(receitaCarregada);
    } catch (error: any) {
      toast({
        title: "Receita não encontrada",
        description:
          error.response?.data?.message ||
          "Não foi possível encontrar a receita com este código",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buscarPorCpf = async () => {
    if (!cpfPaciente.trim() || cpfPaciente.replace(/\D/g, "").length < 11) {
      toast({
        title: "Erro",
        description: "Digite um CPF válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingCpf(true);
    setReceita(null);
    setReceitasPaciente([]);
    setPacienteNome("");

    try {
      // Primeiro busca o paciente pelo CPF
      const cpfLimpo = cpfPaciente.replace(/\D/g, "");
      const pacienteResponse = await pacientesApi.buscarPorDocumento(cpfLimpo);
      const paciente = pacienteResponse.data.data;

      if (!paciente) {
        toast({
          title: "Paciente não encontrado",
          description: "Não foi possível encontrar um paciente com este CPF",
          variant: "destructive",
        });
        return;
      }

      setPacienteNome(paciente.usuario?.nome || "");

      // Busca as receitas do paciente
      const receitasResponse = await pacientesApi.historicoReceitas(
        paciente.id
      );
      const receitas = receitasResponse.data.data?.receitas || [];

      // Filtra apenas receitas ativas
      const receitasAtivas = receitas.filter(
        (r: Receita) => r.status === "ATIVA"
      );

      if (receitasAtivas.length === 0) {
        toast({
          title: "Nenhuma receita ativa",
          description: "Este paciente não possui receitas ativas no momento",
          variant: "default",
        });
      }

      setReceitasPaciente(receitasAtivas);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar",
        description:
          error.response?.data?.message ||
          "Não foi possível encontrar o paciente",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCpf(false);
    }
  };

  const selecionarReceita = async (receitaSelecionada: Receita) => {
    // Busca a receita completa pelo código para ter todos os dados
    setIsLoading(true);
    try {
      const response = await receitasApi.buscarPorCodigo(
        receitaSelecionada.codigo
      );
      const receitaCarregada = response.data.data;
      setReceita(receitaCarregada);
      inicializarItensDispensados(receitaCarregada);
      setReceitasPaciente([]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar receita",
        description:
          error.response?.data?.message ||
          "Não foi possível carregar os detalhes da receita",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dispensarReceita = async () => {
    if (!receita) return;

    setIsDispensando(true);

    try {
      await receitasApi.dispensar(receita.id, {
        observacoes: observacoesDispensacao || undefined,
        itensDispensados: itensDispensados,
      });

      toast({
        title: "Receita dispensada!",
        description: "A receita foi dispensada com sucesso.",
      });

      setShowConfirmDialog(false);
      setReceita(null);
      setCodigoReceita("");
      setCpfPaciente("");
      setReceitasPaciente([]);
      setObservacoesDispensacao("");
      setItensDispensados([]);
    } catch (error: any) {
      toast({
        title: "Erro ao dispensar",
        description:
          error.response?.data?.message ||
          "Não foi possível dispensar a receita",
        variant: "destructive",
      });
    } finally {
      setIsDispensando(false);
    }
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
      EXPIRADA: { label: "Expirada", variant: "destructive" },
      CANCELADA: { label: "Cancelada", variant: "destructive" },
    };
    const config = statusConfig[status] || {
      label: status,
      variant: "outline",
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const isReceitaValida = receita?.status === "ATIVA";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showNav={false} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/farmacia")}
              className="flex items-center gap-2 text-gray-600 hover:text-navy transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar ao Painel</span>
            </button>
            <h1 className="text-3xl font-bold text-navy">Validar Receita</h1>
            <p className="text-gray-600 mt-1">
              Busque pelo código da receita ou pelo CPF do paciente
            </p>
          </div>

          {/* Busca com Tabs */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="codigo" className="gap-2">
                    <QrCode className="w-4 h-4" />
                    Código da Receita
                  </TabsTrigger>
                  <TabsTrigger value="cpf" className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    CPF do Paciente
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="codigo">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="codigo" className="text-sm font-medium">
                        Código da Receita
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="codigo"
                          type="text"
                          placeholder="Digite o código da receita"
                          value={codigoReceita}
                          onChange={(e) => setCodigoReceita(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && buscarReceita()
                          }
                          className="h-12 pl-10 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                        <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={buscarReceita}
                        disabled={isLoading || !codigoReceita.trim()}
                        className="h-12 px-8 bg-teal hover:bg-teal/90 text-white"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Search className="w-5 h-5 mr-2" />
                            Buscar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cpf">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="cpf" className="text-sm font-medium">
                        CPF do Paciente
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="cpf"
                          type="text"
                          placeholder="Digite o CPF do paciente (ex: 000.000.000-00)"
                          value={cpfPaciente}
                          onChange={(e) => handleCpfChange(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && buscarPorCpf()}
                          className="h-12 pl-10 border-2 border-gray-200 focus:border-teal rounded-lg"
                          maxLength={14}
                        />
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={buscarPorCpf}
                        disabled={
                          isLoadingCpf ||
                          cpfPaciente.replace(/\D/g, "").length < 11
                        }
                        className="h-12 px-8 bg-teal hover:bg-teal/90 text-white"
                      >
                        {isLoadingCpf ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Search className="w-5 h-5 mr-2" />
                            Buscar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Lista de Receitas do Paciente */}
          {receitasPaciente.length > 0 && !receita && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-teal" />
                  Receitas Ativas de {pacienteNome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {receitasPaciente.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => selecionarReceita(rec)}
                      className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal hover:bg-teal/5 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-navy">
                            Código: {rec.codigo}
                          </p>
                          <p className="text-sm text-gray-600">
                            Dr(a). {rec.medico?.usuario?.nome} •{" "}
                            {rec.itens?.length || 0} medicamento(s)
                          </p>
                          <p className="text-sm text-gray-500">
                            Válida até: {formatarData(rec.validadeAte)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(rec.status)}
                          <ArrowLeft className="w-4 h-4 rotate-180 text-gray-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resultado da Receita */}
          {receita && (
            <div className="space-y-6 animate-fade-in">
              {/* Status Card */}
              <Card
                className={`border-2 ${
                  isReceitaValida
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {isReceitaValida ? (
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    ) : (
                      <AlertCircle className="w-12 h-12 text-red-600" />
                    )}
                    <div className="flex-1">
                      <h2
                        className={`text-xl font-bold ${
                          isReceitaValida ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {isReceitaValida
                          ? "Receita Válida"
                          : `Receita ${
                              receita.status === "DISPENSADA"
                                ? "Já Dispensada"
                                : receita.status === "EXPIRADA"
                                ? "Expirada"
                                : "Inválida"
                            }`}
                      </h2>
                      <p
                        className={`text-sm ${
                          isReceitaValida ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        Código: {receita.codigo}
                      </p>
                    </div>
                    <div>{getStatusBadge(receita.status)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações da Receita */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Paciente */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="w-5 h-5 text-teal" />
                      Paciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Nome:</span>
                      <p className="font-medium">
                        {receita.paciente.usuario.nome}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">CPF:</span>
                        <p className="font-medium">{receita.paciente.cpf}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Idade:</span>
                        <p className="font-medium">
                          {calcularIdade(receita.paciente.dataNascimento)} anos
                        </p>
                      </div>
                    </div>
                    {receita.paciente.cartaoSus && (
                      <div>
                        <span className="text-sm text-gray-500">
                          Cartão SUS:
                        </span>
                        <p className="font-medium">
                          {receita.paciente.cartaoSus}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Médico */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Stethoscope className="w-5 h-5 text-teal" />
                      Médico Prescritor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Nome:</span>
                      <p className="font-medium">
                        Dr(a). {receita.medico.usuario.nome}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">CRM:</span>
                        <p className="font-medium">
                          {receita.medico.crm}/{receita.medico.ufCrm}
                        </p>
                      </div>
                      {receita.medico.especialidade && (
                        <div>
                          <span className="text-sm text-gray-500">
                            Especialidade:
                          </span>
                          <p className="font-medium">
                            {receita.medico.especialidade}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Datas */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">
                          Emitida em:
                        </span>
                        <p className="font-medium">
                          {formatarData(receita.criadoEm)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">
                          Válida até:
                        </span>
                        <p className="font-medium">
                          {formatarData(receita.validadeAte)}
                        </p>
                      </div>
                    </div>
                    {receita.dispensadoEm && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <span className="text-sm text-gray-500">
                            Dispensada em:
                          </span>
                          <p className="font-medium">
                            {formatarData(receita.dispensadoEm)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Diagnóstico */}
              {receita.diagnostico && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Diagnóstico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{receita.diagnostico}</p>
                  </CardContent>
                </Card>
              )}

              {/* Medicamentos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pill className="w-5 h-5 text-teal" />
                    Medicamentos Prescritos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {receita.itens.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-navy">
                              {item.medicamento}
                              {item.principioAtivo && (
                                <span className="font-normal text-gray-500">
                                  {" "}
                                  ({item.principioAtivo})
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {item.dosagem}
                              {item.formaFarmaceutica &&
                                ` - ${item.formaFarmaceutica}`}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">Posologia:</span>{" "}
                              {item.posologia}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Quantidade:</span>{" "}
                              {item.quantidade} unidade(s)
                            </p>
                            {item.observacao && (
                              <p className="text-sm text-gray-500 italic mt-1">
                                Obs: {item.observacao}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              {receita.observacoes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Observações do Médico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{receita.observacoes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Botão Dispensar */}
              {isReceitaValida && (
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  className="w-full h-14 text-lg font-semibold bg-teal hover:bg-teal/90 text-white rounded-xl"
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Dispensar Receita
                </Button>
              )}
            </div>
          )}

          {/* Estado Vazio */}
          {!receita &&
            !isLoading &&
            !isLoadingCpf &&
            receitasPaciente.length === 0 && (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Nenhuma receita selecionada
                  </h3>
                  <p className="text-gray-500">
                    Busque pelo código da receita ou pelo CPF do paciente
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      </main>

      {/* Dialog de Confirmação */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmar Dispensação</DialogTitle>
            <DialogDescription>
              Você está prestes a dispensar os medicamentos desta receita para o
              paciente <strong>{receita?.paciente.usuario.nome}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Itens da Receita */}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3">
                Itens a serem dispensados
              </h4>
              <div className="space-y-4">
                {receita?.itens.map((item, index) => {
                  const itemDispensado = itensDispensados.find(
                    (i) => i.itemReceitaId === item.id
                  );
                  return (
                    <Card key={item.id} className="p-4">
                      <div className="space-y-3">
                        {/* Informações originais da prescrição */}
                        <div className="bg-gray-50 rounded-md p-3 text-sm">
                          <p className="font-medium text-gray-700">
                            Prescrito:
                          </p>
                          <p className="text-gray-600">
                            {item.medicamento} - {item.quantidade}{" "}
                            {item.formaFarmaceutica || "unidade(s)"}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {item.posologia}
                          </p>
                        </div>

                        {/* Campos de edição */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label
                              htmlFor={`med-${item.id}`}
                              className="text-xs"
                            >
                              Medicamento entregue
                            </Label>
                            <Input
                              id={`med-${item.id}`}
                              value={itemDispensado?.medicamentoEntregue || ""}
                              onChange={(e) =>
                                atualizarItemDispensado(
                                  item.id,
                                  "medicamentoEntregue",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: Dipirona 500mg gotas"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`qtd-${item.id}`}
                              className="text-xs"
                            >
                              Quantidade entregue
                            </Label>
                            <Input
                              id={`qtd-${item.id}`}
                              value={itemDispensado?.quantidadeEntregue || ""}
                              onChange={(e) =>
                                atualizarItemDispensado(
                                  item.id,
                                  "quantidadeEntregue",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: 1 frasco"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor={`obs-item-${item.id}`}
                            className="text-xs"
                          >
                            Observação do item (opcional)
                          </Label>
                          <Textarea
                            id={`obs-item-${item.id}`}
                            value={itemDispensado?.observacao || ""}
                            onChange={(e) =>
                              atualizarItemDispensado(
                                item.id,
                                "observacao",
                                e.target.value
                              )
                            }
                            placeholder="Ex: Substituído por formulação em gotas por falta do comprimido em estoque"
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Observações Gerais */}
            <div>
              <Label htmlFor="obs-dispensacao">
                Observações gerais (opcional)
              </Label>
              <Textarea
                id="obs-dispensacao"
                placeholder="Adicione observações gerais sobre a dispensação..."
                value={observacoesDispensacao}
                onChange={(e) => setObservacoesDispensacao(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isDispensando}
            >
              Cancelar
            </Button>
            <Button
              onClick={dispensarReceita}
              disabled={isDispensando}
              className="bg-teal hover:bg-teal/90"
            >
              {isDispensando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Dispensando...
                </>
              ) : (
                "Confirmar Dispensação"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ValidarReceita;
