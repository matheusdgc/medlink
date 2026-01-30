import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { pacientesApi } from "@/services/api";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Search,
  User,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Pill,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Edit,
  MapPin,
  Save,
} from "lucide-react";

interface Paciente {
  id: string;
  cpf: string;
  cartaoSus?: string;
  dataNascimento: string;
  sexo?: "MASCULINO" | "FEMININO" | "OUTRO";
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
    criadoEm?: string;
  };
}

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
  medico: {
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

const VerPaciente = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loadingReceitas, setLoadingReceitas] = useState(false);

  const [receitaSelecionada, setReceitaSelecionada] = useState<Receita | null>(
    null
  );
  const [modalReceita, setModalReceita] = useState(false);

  const [modalEditar, setModalEditar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [dadosEdicao, setDadosEdicao] = useState({
    nome: "",
    email: "",
    dataNascimento: "",
    sexo: "" as "MASCULINO" | "FEMININO" | "OUTRO" | "",
    cartaoSus: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  const buscarPaciente = async () => {
    if (!busca.trim()) {
      toast({
        title: "Informe o CPF ou Cartão SUS",
        description: "Digite o documento do paciente para buscar",
        variant: "destructive",
      });
      return;
    }

    try {
      setBuscando(true);
      const response = await pacientesApi.buscarPorDocumento(busca.trim());
      setPaciente(response.data.data);

      await carregarReceitas(response.data.data.id);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast({
          title: "Paciente não encontrado",
          description: "Verifique o CPF ou Cartão SUS informado",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao buscar paciente",
          description:
            error.response?.data?.message || "Tente novamente mais tarde",
          variant: "destructive",
        });
      }
      setPaciente(null);
      setReceitas([]);
    } finally {
      setBuscando(false);
    }
  };

  const carregarReceitas = async (pacienteId: string) => {
    try {
      setLoadingReceitas(true);
      const response = await pacientesApi.historicoReceitas(pacienteId);
      setReceitas(response.data.data.receitas);
    } catch (error: any) {
      console.error("Erro ao carregar receitas:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar as receitas do paciente",
        variant: "destructive",
      });
    } finally {
      setLoadingReceitas(false);
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString("pt-BR");
  };

  const formatarDataHora = (dataString: string) => {
    return new Date(dataString).toLocaleString("pt-BR");
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    if (
      mesAtual < mesNascimento ||
      (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())
    ) {
      idade--;
    }
    return idade;
  };

  const formatarSexo = (sexo?: string) => {
    const sexoMap: Record<string, string> = {
      MASCULINO: "Masculino",
      FEMININO: "Feminino",
      OUTRO: "Outro",
    };
    return sexo ? sexoMap[sexo] || sexo : "Não informado";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: typeof CheckCircle;
      }
    > = {
      ATIVA: { label: "Ativa", variant: "default", icon: CheckCircle },
      DISPENSADA: { label: "Dispensada", variant: "secondary", icon: Pill },
      VENCIDA: { label: "Vencida", variant: "outline", icon: Clock },
      CANCELADA: {
        label: "Cancelada",
        variant: "destructive",
        icon: AlertCircle,
      },
    };
    const config = statusConfig[status] || {
      label: status,
      variant: "outline" as const,
      icon: FileText,
    };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const abrirReceita = (receita: Receita) => {
    setReceitaSelecionada(receita);
    setModalReceita(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      buscarPaciente();
    }
  };

  const abrirModalEditar = () => {
    if (paciente) {
      setDadosEdicao({
        nome: paciente.usuario.nome || "",
        email: paciente.usuario.email.includes("@medlink.local")
          ? ""
          : paciente.usuario.email,
        dataNascimento: paciente.dataNascimento
          ? paciente.dataNascimento.split("T")[0]
          : "",
        sexo: paciente.sexo || "",
        cartaoSus: paciente.cartaoSus || "",
        telefone: paciente.telefone || "",
        endereco: paciente.endereco || "",
        cidade: paciente.cidade || "",
        estado: paciente.estado || "",
        cep: "",
      });
      setModalEditar(true);
    }
  };

  const salvarEdicao = async () => {
    if (!paciente) return;

    try {
      setSalvando(true);

      const dadosParaEnviar: any = {};
      if (dadosEdicao.nome) dadosParaEnviar.nome = dadosEdicao.nome;
      if (dadosEdicao.email) dadosParaEnviar.email = dadosEdicao.email;
      if (dadosEdicao.dataNascimento)
        dadosParaEnviar.dataNascimento = dadosEdicao.dataNascimento;
      if (dadosEdicao.sexo) dadosParaEnviar.sexo = dadosEdicao.sexo;
      if (dadosEdicao.cartaoSus !== undefined)
        dadosParaEnviar.cartaoSus = dadosEdicao.cartaoSus;
      if (dadosEdicao.telefone !== undefined)
        dadosParaEnviar.telefone = dadosEdicao.telefone;
      if (dadosEdicao.endereco !== undefined)
        dadosParaEnviar.endereco = dadosEdicao.endereco;
      if (dadosEdicao.cidade !== undefined)
        dadosParaEnviar.cidade = dadosEdicao.cidade;
      if (dadosEdicao.estado !== undefined)
        dadosParaEnviar.estado = dadosEdicao.estado;
      if (dadosEdicao.cep) dadosParaEnviar.cep = dadosEdicao.cep;

      await pacientesApi.atualizar(paciente.id, dadosParaEnviar);

      setPaciente({
        ...paciente,
        usuario: {
          ...paciente.usuario,
          nome: dadosEdicao.nome || paciente.usuario.nome,
          email: dadosEdicao.email || paciente.usuario.email,
        },
        dataNascimento: dadosEdicao.dataNascimento || paciente.dataNascimento,
        sexo: dadosEdicao.sexo || paciente.sexo,
        cartaoSus: dadosEdicao.cartaoSus || paciente.cartaoSus,
        telefone: dadosEdicao.telefone || paciente.telefone,
        endereco: dadosEdicao.endereco || paciente.endereco,
        cidade: dadosEdicao.cidade || paciente.cidade,
        estado: dadosEdicao.estado || paciente.estado,
      });

      toast({
        title: "Perfil atualizado!",
        description: "Os dados do paciente foram salvos com sucesso.",
      });

      setModalEditar(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.response?.data?.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Ver Paciente
              </h1>
              <p className="text-muted-foreground">
                Consulte dados e histórico do paciente
              </p>
            </div>
          </div>

          {/* Busca */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite o CPF ou Cartão SUS do paciente..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={buscarPaciente}
                  disabled={buscando}
                  className="bg-navy hover:bg-navy-light"
                >
                  {buscando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Paciente */}
          {paciente && (
            <div className="space-y-6 animate-fade-in">
              {/* Card Principal */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-navy/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-navy" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {paciente.usuario.nome}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {calcularIdade(paciente.dataNascimento)} anos •{" "}
                          {formatarSexo(paciente.sexo)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          paciente.usuario.ativo ? "default" : "destructive"
                        }
                      >
                        {paciente.usuario.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={abrirModalEditar}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CPF */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">CPF</p>
                        <p className="font-medium">{paciente.cpf}</p>
                      </div>
                    </div>

                    {/* Cartão SUS */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Cartão SUS
                        </p>
                        <p className="font-medium">
                          {paciente.cartaoSus || "Não informado"}
                        </p>
                      </div>
                    </div>

                    {/* Data Nascimento */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Data de Nascimento
                        </p>
                        <p className="font-medium">
                          {formatarData(paciente.dataNascimento)}
                        </p>
                      </div>
                    </div>

                    {/* Telefone */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Telefone
                        </p>
                        <p className="font-medium">
                          {paciente.telefone || "Não informado"}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg md:col-span-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">
                          {paciente.usuario.email.includes("@medlink.local")
                            ? "Não informado"
                            : paciente.usuario.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Histórico de Receitas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Histórico de Receitas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingReceitas ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-navy" />
                    </div>
                  ) : receitas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma receita encontrada para este paciente</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {receitas.map((receita) => (
                        <div
                          key={receita.id}
                          onClick={() => abrirReceita(receita)}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-1 rounded-full bg-navy" />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs bg-background px-2 py-0.5 rounded">
                                  {receita.codigo}
                                </span>
                                {getStatusBadge(receita.status)}
                              </div>
                              <p className="text-sm font-medium">
                                {receita.itens
                                  .slice(0, 2)
                                  .map((i) => i.medicamento)
                                  .join(", ")}
                                {receita.itens.length > 2 &&
                                  ` +${receita.itens.length - 2}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Dr(a). {receita.medico.usuario.nome} •{" "}
                                {formatarData(receita.criadaEm)}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Estado inicial */}
          {!paciente && !buscando && (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Buscar Paciente</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Digite o CPF ou Cartão SUS do paciente para visualizar seus
                  dados e histórico de receitas
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal de Detalhes da Receita */}
      <Dialog open={modalReceita} onOpenChange={setModalReceita}>
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
              {/* Status e Info */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(receitaSelecionada.status)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Validade</p>
                  <p className="font-medium">
                    {formatarData(receitaSelecionada.validadeAte)}
                  </p>
                </div>
              </div>

              {/* Médico */}
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    Médico Prescritor
                  </p>
                  <p className="font-medium">
                    Dr(a). {receitaSelecionada.medico.usuario.nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CRM: {receitaSelecionada.medico.crm}
                  </p>
                </CardContent>
              </Card>

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
                    Medicamentos Prescritos
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

              {/* Datas */}
              <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>
                  Emitida em: {formatarData(receitaSelecionada.criadaEm)}
                </span>
                <span>
                  Válida até: {formatarData(receitaSelecionada.validadeAte)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição do Paciente */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Paciente
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do paciente. O CPF não pode ser alterado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* CPF (não editável) */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                CPF (não editável)
              </p>
              <p className="font-medium">{paciente?.cpf}</p>
            </div>

            {/* Dados Pessoais */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Dados Pessoais
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="md:col-span-2">
                  <Label htmlFor="nome">
                    <User className="h-4 w-4 inline mr-2" />
                    Nome Completo
                  </Label>
                  <Input
                    id="nome"
                    placeholder="Nome completo"
                    value={dadosEdicao.nome}
                    onChange={(e) =>
                      setDadosEdicao((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={dadosEdicao.email}
                    onChange={(e) =>
                      setDadosEdicao((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* Data de Nascimento */}
                <div>
                  <Label htmlFor="dataNascimento">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Data de Nascimento
                  </Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={dadosEdicao.dataNascimento}
                    onChange={(e) =>
                      setDadosEdicao((prev) => ({
                        ...prev,
                        dataNascimento: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* Sexo */}
                <div>
                  <Label>Sexo</Label>
                  <Select
                    value={dadosEdicao.sexo}
                    onValueChange={(value) =>
                      setDadosEdicao((prev) => ({
                        ...prev,
                        sexo: value as "MASCULINO" | "FEMININO" | "OUTRO",
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MASCULINO">Masculino</SelectItem>
                      <SelectItem value="FEMININO">Feminino</SelectItem>
                      <SelectItem value="OUTRO">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cartão SUS */}
                <div>
                  <Label htmlFor="cartaoSus">
                    <CreditCard className="h-4 w-4 inline mr-2" />
                    Cartão SUS
                  </Label>
                  <Input
                    id="cartaoSus"
                    placeholder="Número do cartão SUS"
                    value={dadosEdicao.cartaoSus}
                    onChange={(e) =>
                      setDadosEdicao((prev) => ({
                        ...prev,
                        cartaoSus: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <Label htmlFor="telefone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={dadosEdicao.telefone}
                    onChange={(e) =>
                      setDadosEdicao((prev) => ({
                        ...prev,
                        telefone: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                <MapPin className="h-4 w-4 inline mr-2" />
                Endereço
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, número, complemento"
                    value={dadosEdicao.endereco}
                    onChange={(e) =>
                      setDadosEdicao((prev) => ({
                        ...prev,
                        endereco: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    placeholder="Cidade"
                    value={dadosEdicao.cidade}
                    onChange={(e) =>
                      setDadosEdicao((prev) => ({
                        ...prev,
                        cidade: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      placeholder="UF"
                      maxLength={2}
                      value={dadosEdicao.estado}
                      onChange={(e) =>
                        setDadosEdicao((prev) => ({
                          ...prev,
                          estado: e.target.value.toUpperCase(),
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={dadosEdicao.cep}
                      onChange={(e) =>
                        setDadosEdicao((prev) => ({
                          ...prev,
                          cep: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setModalEditar(false)}
              disabled={salvando}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarEdicao}
              disabled={salvando}
              className="flex-1 bg-navy hover:bg-navy-light"
            >
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerPaciente;
