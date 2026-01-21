import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Lista de especialidades médicas
const especialidadesMedicas = [
  "Clínica Geral",
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Geriatria",
  "Ginecologia",
  "Neurologia",
  "Oftalmologia",
  "Ortopedia",
  "Otorrinolaringologia",
  "Pediatria",
  "Pneumologia",
  "Psiquiatria",
  "Reumatologia",
  "Urologia",
  "Outra",
];

// Lista de UFs brasileiras
const ufs = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const LoginProfissional = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get("tipo") || "medico";
  const { loginProfissional, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "cadastro">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Cadastro fields
  const [cadastroData, setCadastroData] = useState({
    nome: "",
    email: "",
    cpf: "",
    dataNascimento: "",
    funcao: tipo as "medico" | "farmacia",
    // Médico fields
    crm: "",
    ufCrm: "",
    especialidade: "",
    telefone: "",
    nomeClinica: "",
    enderecoClinica: "",
    // Farmácia fields
    crf: "",
    ufCrf: "",
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    senha: "",
    confirmarSenha: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setCadastroData((prev) => ({ ...prev, [field]: value }));
  };

  // Validação de CPF
  const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.charAt(10));
  };

  // Validação de CRM (formato: 6 dígitos)
  const validarCRM = (crm: string): boolean => {
    const crmLimpo = crm.replace(/[^\d]/g, "");
    return crmLimpo.length >= 4 && crmLimpo.length <= 6;
  };

  // Validação de CRF (formato: 5-6 dígitos)
  const validarCRF = (crf: string): boolean => {
    const crfLimpo = crf.replace(/[^\d]/g, "");
    return crfLimpo.length >= 4 && crfLimpo.length <= 6;
  };

  // Validação de CNPJ
  const validarCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]/g, "");
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  };

  // Formatação de CPF
  const formatarCPF = (value: string) => {
    const numeros = value.replace(/\D/g, "").slice(0, 11);
    return numeros
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  // Formatação de CNPJ
  const formatarCNPJ = (value: string) => {
    const numeros = value.replace(/\D/g, "").slice(0, 14);
    return numeros
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !senha.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    try {
      await loginProfissional({ email, senha });
      if (tipo === "medico") {
        navigate("/medico");
      } else {
        navigate("/farmacia");
      }
    } catch (error) {
      // Error is handled in context with toast
    }
  };

  const handleCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validações básicas
    if (
      !cadastroData.nome.trim() ||
      !cadastroData.email.trim() ||
      !cadastroData.senha.trim()
    ) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validar CPF
    if (!validarCPF(cadastroData.cpf)) {
      toast({
        title: "Erro",
        description: "CPF inválido",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validar senhas
    if (cadastroData.senha !== cadastroData.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (cadastroData.senha.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (cadastroData.funcao === "medico") {
        // Validar CRM
        if (!validarCRM(cadastroData.crm)) {
          toast({
            title: "Erro",
            description: "CRM inválido (deve ter 4-6 dígitos)",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!cadastroData.ufCrm) {
          toast({
            title: "Erro",
            description: "Selecione a UF do CRM",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!cadastroData.especialidade) {
          toast({
            title: "Erro",
            description: "Selecione a especialidade",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        await authApi.registerMedico({
          nome: cadastroData.nome,
          email: cadastroData.email,
          senha: cadastroData.senha,
          crm: cadastroData.crm.replace(/\D/g, ""),
          ufCrm: cadastroData.ufCrm,
          especialidade: cadastroData.especialidade,
          telefone: cadastroData.telefone,
          nomeClinica: cadastroData.nomeClinica,
          enderecoClinica: cadastroData.enderecoClinica,
        });

        toast({
          title: "Sucesso!",
          description:
            "Cadastro realizado com sucesso. Faça login para continuar.",
        });
        setMode("login");
        setEmail(cadastroData.email);
      } else {
        // Farmácia
        if (!validarCRF(cadastroData.crf)) {
          toast({
            title: "Erro",
            description: "CRF inválido (deve ter 4-6 dígitos)",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!cadastroData.ufCrf) {
          toast({
            title: "Erro",
            description: "Selecione a UF do CRF",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!validarCNPJ(cadastroData.cnpj)) {
          toast({
            title: "Erro",
            description: "CNPJ inválido",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!cadastroData.razaoSocial.trim()) {
          toast({
            title: "Erro",
            description: "Informe a razão social",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        await authApi.registerFarmacia({
          nome: cadastroData.nome,
          email: cadastroData.email,
          senha: cadastroData.senha,
          crf: cadastroData.crf.replace(/\D/g, ""),
          ufCrf: cadastroData.ufCrf,
          cnpj: cadastroData.cnpj.replace(/\D/g, ""),
          razaoSocial: cadastroData.razaoSocial,
          nomeFantasia: cadastroData.nomeFantasia,
          telefone: cadastroData.telefone,
          endereco: cadastroData.endereco,
          cidade: cadastroData.cidade,
          estado: cadastroData.estado,
          cep: cadastroData.cep,
        });

        toast({
          title: "Sucesso!",
          description:
            "Cadastro realizado com sucesso. Faça login para continuar.",
        });
        setMode("login");
        setEmail(cadastroData.email);
      }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description:
          error.response?.data?.message || "Erro ao realizar cadastro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {mode === "login" ? (
        <>
          <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
            {/* Image Section - Login */}
            <div className="hidden lg:block lg:w-1/2 h-screen sticky top-0">
              <img
                src={
                  tipo === "farmacia"
                    ? "/images/imagem-tela-farmacia.png"
                    : "/images/imagem-tela-medico.png"
                }
                alt="Profissional de saúde"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Form Section - Login */}
            <div className="flex-1 flex flex-col lg:w-1/2">
              <div className="p-6">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 text-gray-600 hover:text-navy transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Voltar</span>
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-md space-y-6 animate-fade-in">
                  <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                      Login
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                      {tipo === "medico"
                        ? "Acesse sua conta de médico"
                        : "Acesse sua conta de farmácia"}
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="h-12 border-2 border-gray-200 focus:border-teal rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha</Label>
                      <div className="relative">
                        <Input
                          id="senha"
                          type={showPassword ? "text" : "password"}
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          placeholder="••••••••"
                          className="h-12 border-2 border-gray-200 focus:border-teal rounded-lg pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={authLoading || !email.trim() || !senha.trim()}
                        className="w-full h-12 text-base font-semibold bg-navy hover:bg-navy/90 text-white rounded-lg"
                      >
                        {authLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          "Entrar"
                        )}
                      </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      Não tem uma conta?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("cadastro")}
                        className="text-teal hover:text-teal/80 font-medium"
                      >
                        Cadastre-se aqui
                      </button>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="p-6">
            <button
              onClick={() => setMode("login")}
              className="flex items-center gap-2 text-gray-600 hover:text-navy transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar para login</span>
            </button>
          </div>

          <div className="flex-1 flex items-start justify-center px-6 py-4 overflow-y-auto">
            <div className="w-full max-w-2xl space-y-6 animate-fade-in pb-8">
              <div className="text-center">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Crie sua Conta
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Preencha os dados abaixo para se cadastrar
                </p>
              </div>

              <form onSubmit={handleCadastroSubmit} className="space-y-4">
                {/* Dados Pessoais */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-navy text-sm uppercase tracking-wide">
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome Completo */}
                    <div className="space-y-1">
                      <Label htmlFor="nome" className="text-sm">
                        Nome Completo
                      </Label>
                      <Input
                        id="nome"
                        type="text"
                        value={cadastroData.nome}
                        onChange={(e) =>
                          handleInputChange("nome", e.target.value)
                        }
                        className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <Label htmlFor="cadastroEmail" className="text-sm">
                        Email
                      </Label>
                      <Input
                        id="cadastroEmail"
                        type="email"
                        value={cadastroData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                      />
                    </div>

                    {/* CPF */}
                    <div className="space-y-1">
                      <Label htmlFor="cpf" className="text-sm">
                        CPF
                      </Label>
                      <Input
                        id="cpf"
                        type="text"
                        value={cadastroData.cpf}
                        onChange={(e) =>
                          handleInputChange("cpf", formatarCPF(e.target.value))
                        }
                        placeholder="000.000.000-00"
                        className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                      />
                    </div>

                    {/* Data de Nascimento */}
                    <div className="space-y-1">
                      <Label htmlFor="dataNascimento" className="text-sm">
                        Data de Nascimento
                      </Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={cadastroData.dataNascimento}
                        onChange={(e) =>
                          handleInputChange("dataNascimento", e.target.value)
                        }
                        className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Função */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-navy text-sm uppercase tracking-wide">
                    Função Profissional
                  </h3>
                  <div className="space-y-1">
                    <Label className="text-sm">Qual sua função?</Label>
                    <Select
                      value={cadastroData.funcao}
                      onValueChange={(value) =>
                        handleInputChange("funcao", value)
                      }
                    >
                      <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg">
                        <SelectValue placeholder="Selecione sua função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medico">Médico</SelectItem>
                        <SelectItem value="farmacia">Farmacêutico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campos específicos para Médico */}
                  {cadastroData.funcao === "medico" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <Label htmlFor="crm" className="text-sm">
                          CRM
                        </Label>
                        <Input
                          id="crm"
                          type="text"
                          value={cadastroData.crm}
                          onChange={(e) =>
                            handleInputChange(
                              "crm",
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          placeholder="123456"
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="ufCrm" className="text-sm">
                          UF do CRM
                        </Label>
                        <Select
                          value={cadastroData.ufCrm}
                          onValueChange={(value) =>
                            handleInputChange("ufCrm", value)
                          }
                        >
                          <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg">
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {ufs.map((uf) => (
                              <SelectItem key={uf} value={uf}>
                                {uf}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label htmlFor="especialidade" className="text-sm">
                          Especialidade
                        </Label>
                        <Select
                          value={cadastroData.especialidade}
                          onValueChange={(value) =>
                            handleInputChange("especialidade", value)
                          }
                        >
                          <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg">
                            <SelectValue placeholder="Selecione a especialidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {especialidadesMedicas.map((esp) => (
                              <SelectItem key={esp} value={esp}>
                                {esp}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="telefone" className="text-sm">
                          Telefone
                        </Label>
                        <Input
                          id="telefone"
                          type="tel"
                          value={cadastroData.telefone}
                          onChange={(e) =>
                            handleInputChange("telefone", e.target.value)
                          }
                          placeholder="(11) 99999-9999"
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="nomeClinica" className="text-sm">
                          Nome da Clínica (opcional)
                        </Label>
                        <Input
                          id="nomeClinica"
                          type="text"
                          value={cadastroData.nomeClinica}
                          onChange={(e) =>
                            handleInputChange("nomeClinica", e.target.value)
                          }
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label htmlFor="enderecoClinica" className="text-sm">
                          Endereço da Clínica (opcional)
                        </Label>
                        <Input
                          id="enderecoClinica"
                          type="text"
                          value={cadastroData.enderecoClinica}
                          onChange={(e) =>
                            handleInputChange("enderecoClinica", e.target.value)
                          }
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Campos específicos para Farmacêutico */}
                  {cadastroData.funcao === "farmacia" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <Label htmlFor="crf" className="text-sm">
                          CRF
                        </Label>
                        <Input
                          id="crf"
                          type="text"
                          value={cadastroData.crf}
                          onChange={(e) =>
                            handleInputChange(
                              "crf",
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          placeholder="12345"
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="ufCrf" className="text-sm">
                          UF do CRF
                        </Label>
                        <Select
                          value={cadastroData.ufCrf}
                          onValueChange={(value) =>
                            handleInputChange("ufCrf", value)
                          }
                        >
                          <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg">
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {ufs.map((uf) => (
                              <SelectItem key={uf} value={uf}>
                                {uf}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cnpj" className="text-sm">
                          CNPJ
                        </Label>
                        <Input
                          id="cnpj"
                          type="text"
                          value={cadastroData.cnpj}
                          onChange={(e) =>
                            handleInputChange(
                              "cnpj",
                              formatarCNPJ(e.target.value)
                            )
                          }
                          placeholder="00.000.000/0000-00"
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="razaoSocial" className="text-sm">
                          Razão Social
                        </Label>
                        <Input
                          id="razaoSocial"
                          type="text"
                          value={cadastroData.razaoSocial}
                          onChange={(e) =>
                            handleInputChange("razaoSocial", e.target.value)
                          }
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="nomeFantasia" className="text-sm">
                          Nome Fantasia (opcional)
                        </Label>
                        <Input
                          id="nomeFantasia"
                          type="text"
                          value={cadastroData.nomeFantasia}
                          onChange={(e) =>
                            handleInputChange("nomeFantasia", e.target.value)
                          }
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="farmTelefone" className="text-sm">
                          Telefone
                        </Label>
                        <Input
                          id="farmTelefone"
                          type="tel"
                          value={cadastroData.telefone}
                          onChange={(e) =>
                            handleInputChange("telefone", e.target.value)
                          }
                          placeholder="(11) 99999-9999"
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label htmlFor="farmEndereco" className="text-sm">
                          Endereço
                        </Label>
                        <Input
                          id="farmEndereco"
                          type="text"
                          value={cadastroData.endereco}
                          onChange={(e) =>
                            handleInputChange("endereco", e.target.value)
                          }
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cidade" className="text-sm">
                          Cidade
                        </Label>
                        <Input
                          id="cidade"
                          type="text"
                          value={cadastroData.cidade}
                          onChange={(e) =>
                            handleInputChange("cidade", e.target.value)
                          }
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="estado" className="text-sm">
                            Estado
                          </Label>
                          <Select
                            value={cadastroData.estado}
                            onValueChange={(value) =>
                              handleInputChange("estado", value)
                            }
                          >
                            <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg">
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                              {ufs.map((uf) => (
                                <SelectItem key={uf} value={uf}>
                                  {uf}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="cep" className="text-sm">
                            CEP
                          </Label>
                          <Input
                            id="cep"
                            type="text"
                            value={cadastroData.cep}
                            onChange={(e) =>
                              handleInputChange("cep", e.target.value)
                            }
                            placeholder="00000-000"
                            className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Senha */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-navy text-sm uppercase tracking-wide">
                    Senha de Acesso
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="cadastroSenha" className="text-sm">
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="cadastroSenha"
                          type={showPassword ? "text" : "password"}
                          value={cadastroData.senha}
                          onChange={(e) =>
                            handleInputChange("senha", e.target.value)
                          }
                          className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirmarSenha" className="text-sm">
                        Confirmar Senha
                      </Label>
                      <Input
                        id="confirmarSenha"
                        type="password"
                        value={cadastroData.confirmarSenha}
                        onChange={(e) =>
                          handleInputChange("confirmarSenha", e.target.value)
                        }
                        className="h-11 border-2 border-gray-200 focus:border-teal rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold bg-navy hover:bg-navy/90 text-white rounded-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar-se"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-teal hover:text-teal/80 font-medium"
                  >
                    Faça login
                  </button>
                </p>
              </form>
            </div>
          </div>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default LoginProfissional;
