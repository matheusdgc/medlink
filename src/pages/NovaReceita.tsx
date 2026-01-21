import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  User,
  Stethoscope,
  Heart,
  Wind,
  Pill,
  AlertTriangle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  pacientesApi,
  receitasApi,
  authApi,
  CriarReceitaData,
  RegisterPacienteData,
} from "@/services/api";

interface Paciente {
  id: string;
  cpf: string;
  cartaoSus?: string;
  dataNascimento: string;
  usuario: {
    nome: string;
    email: string;
  };
}

interface ItemReceita {
  medicamento: string;
  principioAtivo: string;
  dosagem: string;
  formaFarmaceutica: string;
  quantidade: number;
  posologia: string;
  observacao: string;
}

const itemVazio: ItemReceita = {
  medicamento: "",
  principioAtivo: "",
  dosagem: "",
  formaFarmaceutica: "",
  quantidade: 1,
  posologia: "",
  observacao: "",
};

// Função para formatar CPF
const formatCpf = (value: string): string => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
    6,
    9
  )}-${numbers.slice(9)}`;
};

const NovaReceita = () => {
  const navigate = useNavigate();

  // Busca de paciente
  const [cpfBusca, setCpfBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [paciente, setPaciente] = useState<Paciente | null>(null);

  // Dados da receita
  const [validadeDias, setValidadeDias] = useState(30);
  const [diagnostico, setDiagnostico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ItemReceita[]>([{ ...itemVazio }]);

  // Anamnese
  const [possuiAlergia, setPossuiAlergia] = useState(false);
  const [alergias, setAlergias] = useState("");
  const [possuiAgravante, setPossuiAgravante] = useState(false);
  const [agravantes, setAgravantes] = useState<string[]>([]);
  const [outraDoenca, setOutraDoenca] = useState("");

  // Envio
  const [enviando, setEnviando] = useState(false);
  const [receitaCriada, setReceitaCriada] = useState<string | null>(null);

  // Etapa de conferência
  const [etapa, setEtapa] = useState<"formulario" | "conferencia">(
    "formulario"
  );

  // Modal de criar paciente
  const [modalCriarPaciente, setModalCriarPaciente] = useState(false);
  const [criandoPaciente, setCriandoPaciente] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    sexo: "" as "" | "MASCULINO" | "FEMININO" | "OUTRO",
    telefone: "",
    // Opcionais
    email: "",
    cartaoSus: "",
  });

  const buscarPaciente = async () => {
    if (!cpfBusca.trim()) {
      toast.error("Digite o CPF do paciente");
      return;
    }

    setBuscando(true);
    try {
      const response = await pacientesApi.buscarPorDocumento(cpfBusca);
      setPaciente(response.data.data);
      toast.success("Paciente encontrado!");
    } catch (error: any) {
      setPaciente(null);
      // Mostrar opção de criar paciente
      toast.error(
        <div className="flex flex-col gap-2">
          <span>Paciente não encontrado</span>
          <button
            onClick={() => {
              setNovoPaciente((prev) => ({ ...prev, cpf: cpfBusca }));
              setModalCriarPaciente(true);
            }}
            className="text-teal underline text-left"
          >
            Cadastrar novo paciente?
          </button>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setBuscando(false);
    }
  };

  const criarNovoPaciente = async () => {
    // Validar campos obrigatórios
    if (!novoPaciente.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!novoPaciente.cpf.trim()) {
      toast.error("CPF é obrigatório");
      return;
    }
    if (!novoPaciente.dataNascimento) {
      toast.error("Data de nascimento é obrigatória");
      return;
    }
    if (!novoPaciente.sexo) {
      toast.error("Sexo é obrigatório");
      return;
    }
    if (!novoPaciente.telefone.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }

    setCriandoPaciente(true);
    try {
      const dados: RegisterPacienteData = {
        nome: novoPaciente.nome,
        cpf: novoPaciente.cpf,
        dataNascimento: new Date(novoPaciente.dataNascimento).toISOString(),
        sexo: novoPaciente.sexo as "MASCULINO" | "FEMININO" | "OUTRO",
        telefone: novoPaciente.telefone,
        // Opcionais
        email: novoPaciente.email || undefined,
        cartaoSus: novoPaciente.cartaoSus || undefined,
      };

      await authApi.registerPaciente(dados);
      toast.success("Paciente cadastrado com sucesso!");

      // Buscar o paciente recém-criado
      const response = await pacientesApi.buscarPorDocumento(novoPaciente.cpf);
      setPaciente(response.data.data);

      // Fechar modal e limpar form
      setModalCriarPaciente(false);
      setNovoPaciente({
        nome: "",
        cpf: "",
        dataNascimento: "",
        sexo: "",
        telefone: "",
        email: "",
        cartaoSus: "",
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erro ao cadastrar paciente"
      );
    } finally {
      setCriandoPaciente(false);
    }
  };

  const adicionarItem = () => {
    setItens([...itens, { ...itemVazio }]);
  };

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const toggleAgravante = (agravante: string) => {
    setAgravantes((prev) =>
      prev.includes(agravante)
        ? prev.filter((a) => a !== agravante)
        : [...prev, agravante]
    );
  };

  const atualizarItem = (
    index: number,
    campo: keyof ItemReceita,
    valor: string | number
  ) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    setItens(novosItens);
  };

  const validarFormulario = (): boolean => {
    if (!paciente) {
      toast.error("Selecione um paciente");
      return false;
    }

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      if (!item.medicamento.trim()) {
        toast.error(`Item ${i + 1}: Nome do medicamento é obrigatório`);
        return false;
      }
      if (!item.dosagem.trim()) {
        toast.error(`Item ${i + 1}: Dosagem é obrigatória`);
        return false;
      }
      if (!item.posologia.trim()) {
        toast.error(`Item ${i + 1}: Posologia é obrigatória`);
        return false;
      }
      if (item.quantidade < 1) {
        toast.error(`Item ${i + 1}: Quantidade deve ser maior que 0`);
        return false;
      }
    }

    return true;
  };

  const irParaConferencia = () => {
    if (!validarFormulario()) return;
    setEtapa("conferencia");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const voltarParaFormulario = () => {
    setEtapa("formulario");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const criarReceita = async () => {
    if (!validarFormulario()) return;

    setEnviando(true);
    try {
      // Calcular data de validade
      const validade = new Date();
      validade.setDate(validade.getDate() + validadeDias);

      const dados: CriarReceitaData = {
        pacienteId: paciente!.id,
        validadeAte: validade.toISOString(),
        diagnostico: diagnostico || undefined,
        observacoes: observacoes || undefined,
        itens: itens.map((item) => ({
          medicamento: item.medicamento,
          principioAtivo: item.principioAtivo || undefined,
          dosagem: item.dosagem,
          formaFarmaceutica: item.formaFarmaceutica || undefined,
          quantidade: item.quantidade,
          posologia: item.posologia,
          observacao: item.observacao || undefined,
        })),
      };

      const response = await receitasApi.criar(dados);
      const codigoReceita = response.data.data.codigo;

      setReceitaCriada(codigoReceita);
      toast.success("Receita criada com sucesso!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao criar receita");
    } finally {
      setEnviando(false);
    }
  };

  // Tela de sucesso
  if (receitaCriada) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header showNav={true} showProfile={true} />

        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Receita Criada!</h2>
              <p className="text-muted-foreground mb-4">
                A receita foi criada com sucesso.
              </p>

              <div className="bg-slate-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  Código da Receita
                </p>
                <p className="text-2xl font-mono font-bold text-navy">
                  {receitaCriada}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setReceitaCriada(null);
                    setPaciente(null);
                    setCpfBusca("");
                    setItens([{ ...itemVazio }]);
                    setDiagnostico("");
                    setObservacoes("");
                  }}
                  className="w-full bg-navy hover:bg-navy-light"
                >
                  Criar Nova Receita
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/medico")}
                  className="w-full"
                >
                  Voltar ao Painel
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  // Tela de conferência
  if (etapa === "conferencia") {
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + validadeDias);

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header showNav={true} showProfile={true} />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={voltarParaFormulario}
                className="flex items-center gap-2 text-navy/70 hover:text-navy mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar e Editar</span>
              </button>

              <h1 className="text-3xl font-bold text-foreground">
                Conferência da Receita
              </h1>
              <p className="text-muted-foreground">
                Revise os dados antes de confirmar
              </p>
            </div>

            {/* Dados do Paciente */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Paciente
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={voltarParaFormulario}
                  className="text-teal"
                >
                  Editar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-semibold text-lg">
                    {paciente?.usuario.nome}
                  </p>
                  <p className="text-muted-foreground">
                    CPF: {paciente?.cpf} • Nascimento:{" "}
                    {paciente?.dataNascimento &&
                      new Date(paciente.dataNascimento).toLocaleDateString(
                        "pt-BR"
                      )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Anamnese */}
            {(possuiAlergia || possuiAgravante) && (
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Anamnese
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={voltarParaFormulario}
                    className="text-teal"
                  >
                    Editar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {possuiAlergia && alergias && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-700">Alergias:</p>
                        <p className="text-muted-foreground">{alergias}</p>
                      </div>
                    </div>
                  )}
                  {possuiAgravante && agravantes.length > 0 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-700">
                          Agravantes:
                        </p>
                        <p className="text-muted-foreground">
                          {agravantes.join(", ")}
                          {agravantes.includes("Outra") &&
                            outraDoenca &&
                            ` - ${outraDoenca}`}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Medicamentos */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Medicamentos ({itens.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={voltarParaFormulario}
                  className="text-teal"
                >
                  Editar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {itens.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 rounded-lg p-4 border-l-4 border-teal"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">
                            {item.medicamento}
                          </p>
                          {item.principioAtivo && (
                            <p className="text-sm text-muted-foreground">
                              Princípio Ativo: {item.principioAtivo}
                            </p>
                          )}
                        </div>
                        <span className="bg-navy text-white px-3 py-1 rounded-full text-sm">
                          {item.quantidade}x
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">
                            Dosagem:
                          </span>{" "}
                          {item.dosagem}
                        </p>
                        {item.formaFarmaceutica && (
                          <p>
                            <span className="text-muted-foreground">
                              Forma:
                            </span>{" "}
                            {item.formaFarmaceutica}
                          </p>
                        )}
                      </div>
                      <p className="mt-2 text-sm bg-white p-2 rounded border">
                        <span className="font-medium">Posologia:</span>{" "}
                        {item.posologia}
                      </p>
                      {item.observacao && (
                        <p className="mt-2 text-sm text-muted-foreground italic">
                          Obs: {item.observacao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Informações da Receita</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={voltarParaFormulario}
                  className="text-teal"
                >
                  Editar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Validade</p>
                    <p className="font-semibold">
                      {validadeDias} dias (até{" "}
                      {dataValidade.toLocaleDateString("pt-BR")})
                    </p>
                  </div>
                  {diagnostico && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Diagnóstico
                      </p>
                      <p className="font-semibold">{diagnostico}</p>
                    </div>
                  )}
                  {observacoes && (
                    <div className="bg-slate-50 rounded-lg p-4 md:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Observações
                      </p>
                      <p className="font-semibold">{observacoes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={voltarParaFormulario}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar e Editar
              </Button>
              <Button
                onClick={criarReceita}
                disabled={enviando}
                className="bg-teal hover:bg-teal-dark gap-2"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando Receita...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirmar e Criar Receita
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/medico")}
              className="flex items-center gap-2 text-navy/70 hover:text-navy mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Painel</span>
            </button>

            <h1 className="text-3xl font-bold text-foreground">Nova Receita</h1>
            <p className="text-muted-foreground">
              Prescreva medicamentos para seu paciente
            </p>
          </div>

          {/* Buscar Paciente */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!paciente ? (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Digite o CPF do paciente"
                        value={cpfBusca}
                        onChange={(e) => setCpfBusca(formatCpf(e.target.value))}
                        onKeyDown={(e) => e.key === "Enter" && buscarPaciente()}
                      />
                    </div>
                    <Button
                      onClick={buscarPaciente}
                      disabled={buscando}
                      className="bg-navy hover:bg-navy-light"
                    >
                      {buscando ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      <span className="ml-2">Buscar</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Paciente não cadastrado?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNovoPaciente((prev) => ({ ...prev, cpf: cpfBusca }));
                        setModalCriarPaciente(true);
                      }}
                      className="text-teal hover:underline font-medium"
                    >
                      Cadastrar novo paciente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                  <div>
                    <p className="font-semibold text-green-800">
                      {paciente.usuario.nome}
                    </p>
                    <p className="text-sm text-green-600">
                      CPF: {paciente.cpf} • Nascimento:{" "}
                      {new Date(paciente.dataNascimento).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPaciente(null);
                      setCpfBusca("");
                    }}
                    className="text-green-700 hover:text-green-900"
                  >
                    Alterar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Anamnese do Paciente */}
          {paciente && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Anamnese do Paciente
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Coloque as condições médicas do paciente
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alergias */}
                <div className="border border-teal/30 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      Possui alguma alergia?
                    </Label>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          possuiAlergia
                            ? "text-teal font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {possuiAlergia ? "Sim" : "Não"}
                      </span>
                      <Switch
                        checked={possuiAlergia}
                        onCheckedChange={setPossuiAlergia}
                        className="data-[state=checked]:bg-teal"
                      />
                    </div>
                  </div>
                  {possuiAlergia && (
                    <Input
                      placeholder="Quais alergias?"
                      value={alergias}
                      onChange={(e) => setAlergias(e.target.value)}
                      className="border-2"
                    />
                  )}
                </div>

                {/* Agravantes */}
                <div className="border border-teal/30 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      Possui algum agravante?
                    </Label>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          possuiAgravante
                            ? "text-teal font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {possuiAgravante ? "Sim" : "Não"}
                      </span>
                      <Switch
                        checked={possuiAgravante}
                        onCheckedChange={setPossuiAgravante}
                        className="data-[state=checked]:bg-teal"
                      />
                    </div>
                  </div>
                  {possuiAgravante && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                          type="button"
                          onClick={() => toggleAgravante("Diabetes")}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            agravantes.includes("Diabetes")
                              ? "bg-teal text-white border-teal"
                              : "bg-white border-teal/30 hover:border-teal"
                          }`}
                        >
                          <Pill className="w-8 h-8" />
                          <span className="text-sm font-medium">Diabetes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAgravante("Hipertensão")}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            agravantes.includes("Hipertensão")
                              ? "bg-teal text-white border-teal"
                              : "bg-white border-teal/30 hover:border-teal"
                          }`}
                        >
                          <Heart className="w-8 h-8" />
                          <span className="text-sm font-medium">
                            Hipertensão
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAgravante("Asma")}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            agravantes.includes("Asma")
                              ? "bg-teal text-white border-teal"
                              : "bg-white border-teal/30 hover:border-teal"
                          }`}
                        >
                          <Wind className="w-8 h-8" />
                          <span className="text-sm font-medium">Asma</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAgravante("Outra")}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            agravantes.includes("Outra")
                              ? "bg-teal text-white border-teal"
                              : "bg-white border-teal/30 hover:border-teal"
                          }`}
                        >
                          <AlertTriangle className="w-8 h-8" />
                          <span className="text-sm font-medium">Outra</span>
                        </button>
                      </div>
                      {agravantes.includes("Outra") && (
                        <Input
                          placeholder="Quais doenças?"
                          value={outraDoenca}
                          onChange={(e) => setOutraDoenca(e.target.value)}
                          className="border-2"
                        />
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medicamentos */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medicamentos</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={adicionarItem}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {itens.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 relative bg-slate-50"
                >
                  {itens.length > 1 && (
                    <button
                      onClick={() => removerItem(index)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Nome do Medicamento *</Label>
                      <Input
                        placeholder="Ex: Dipirona Sódica"
                        value={item.medicamento}
                        onChange={(e) =>
                          atualizarItem(index, "medicamento", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Princípio Ativo</Label>
                      <Input
                        placeholder="Ex: Dipirona"
                        value={item.principioAtivo}
                        onChange={(e) =>
                          atualizarItem(index, "principioAtivo", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Forma Farmacêutica</Label>
                      <Input
                        placeholder="Ex: Comprimido, Cápsula"
                        value={item.formaFarmaceutica}
                        onChange={(e) =>
                          atualizarItem(
                            index,
                            "formaFarmaceutica",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label>Dosagem *</Label>
                      <Input
                        placeholder="Ex: 500mg"
                        value={item.dosagem}
                        onChange={(e) =>
                          atualizarItem(index, "dosagem", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantidade}
                        onChange={(e) =>
                          atualizarItem(
                            index,
                            "quantidade",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Posologia *</Label>
                      <Input
                        placeholder="Ex: Tomar 1 comprimido a cada 8 horas por 5 dias"
                        value={item.posologia}
                        onChange={(e) =>
                          atualizarItem(index, "posologia", e.target.value)
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Observações do Item</Label>
                      <Input
                        placeholder="Observações específicas deste medicamento"
                        value={item.observacao}
                        onChange={(e) =>
                          atualizarItem(index, "observacao", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Validade da Receita (dias)</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={validadeDias}
                  onChange={(e) =>
                    setValidadeDias(parseInt(e.target.value) || 30)
                  }
                  className="max-w-[150px]"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  A receita será válida até{" "}
                  {new Date(
                    Date.now() + validadeDias * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div>
                <Label>Diagnóstico</Label>
                <Input
                  placeholder="CID ou descrição do diagnóstico"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                />
              </div>

              <div>
                <Label>Observações Gerais</Label>
                <Textarea
                  placeholder="Instruções adicionais para o paciente ou farmacêutico"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => navigate("/medico")}>
              Cancelar
            </Button>
            <Button
              onClick={irParaConferencia}
              disabled={!paciente}
              className="bg-navy hover:bg-navy-light gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Revisar Receita
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal Criar Paciente */}
      <Dialog open={modalCriarPaciente} onOpenChange={setModalCriarPaciente}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Cadastrar Novo Paciente
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              O paciente acessará o sistema usando apenas o CPF ou Cartão SUS.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campos Obrigatórios */}
              <div className="md:col-span-2">
                <Label>Nome Completo *</Label>
                <Input
                  placeholder="Nome do paciente"
                  value={novoPaciente.nome}
                  onChange={(e) =>
                    setNovoPaciente((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>CPF *</Label>
                <Input
                  placeholder="000.000.000-00"
                  value={novoPaciente.cpf}
                  onChange={(e) =>
                    setNovoPaciente((prev) => ({
                      ...prev,
                      cpf: formatCpf(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <Label>Data de Nascimento *</Label>
                <Input
                  type="date"
                  value={novoPaciente.dataNascimento}
                  onChange={(e) =>
                    setNovoPaciente((prev) => ({
                      ...prev,
                      dataNascimento: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Sexo *</Label>
                <Select
                  value={novoPaciente.sexo}
                  onValueChange={(value) =>
                    setNovoPaciente((prev) => ({
                      ...prev,
                      sexo: value as "MASCULINO" | "FEMININO" | "OUTRO",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Telefone *</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={novoPaciente.telefone}
                  onChange={(e) =>
                    setNovoPaciente((prev) => ({
                      ...prev,
                      telefone: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Campos Opcionais */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Campos opcionais
                </p>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={novoPaciente.email}
                  onChange={(e) =>
                    setNovoPaciente((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se informado, receberá notificações por email
                </p>
              </div>

              <div>
                <Label>Cartão SUS</Label>
                <Input
                  placeholder="Número do cartão SUS"
                  value={novoPaciente.cartaoSus}
                  onChange={(e) =>
                    setNovoPaciente((prev) => ({
                      ...prev,
                      cartaoSus: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setModalCriarPaciente(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={criarNovoPaciente}
                disabled={criandoPaciente}
                className="flex-1 bg-navy hover:bg-navy-light"
              >
                {criandoPaciente ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Paciente
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NovaReceita;
