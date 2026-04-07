import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Stethoscope,
  Building2,
  MapPin,
  Edit2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { authApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const ESTADOS_BRASIL = [
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

const ESPECIALIDADES_MEDICAS = [
  "Clínico Geral",
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Ginecologia",
  "Neurologia",
  "Oftalmologia",
  "Ortopedia",
  "Otorrinolaringologia",
  "Pediatria",
  "Psiquiatria",
  "Urologia",
  "Geriatria",
  "Infectologia",
  "Nefrologia",
  "Pneumologia",
  "Reumatologia",
  "Oncologia",
  "Cirurgia Geral",
  "Medicina do Trabalho",
  "Medicina de Família",
  "Outra",
];

interface PerfilMedico {
  id: string;
  email: string;
  nome: string;
  tipo: string;
  medico: {
    id: string;
    crm: string;
    ufCrm: string;
    especialidade: string | null;
    telefone: string | null;
    nomeClinica: string | null;
    enderecoClinica: string | null;
    telefoneClinica: string | null;
  };
}

const PerfilMedico = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUserData } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [perfil, setPerfil] = useState<PerfilMedico | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    especialidade: "",
    nomeClinica: "",
    enderecoClinica: "",
    telefoneClinica: "",
  });

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getProfile();
      const data = response.data.data;
      setPerfil(data);

      setFormData({
        nome: data.nome || "",
        email: data.email || "",
        telefone: data.medico?.telefone || "",
        especialidade: data.medico?.especialidade || "",
        nomeClinica: data.medico?.nomeClinica || "",
        enderecoClinica: data.medico?.enderecoClinica || "",
        telefoneClinica: data.medico?.telefoneClinica || "",
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar seus dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatarTelefone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const handleTelefoneChange = (field: string, value: string) => {
    const formatted = formatarTelefone(value);
    setFormData((prev) => ({ ...prev, [field]: formatted }));
  };

  const handleCancelEdit = () => {
    if (perfil) {
      setFormData({
        nome: perfil.nome || "",
        email: perfil.email || "",
        telefone: perfil.medico?.telefone || "",
        especialidade: perfil.medico?.especialidade || "",
        nomeClinica: perfil.medico?.nomeClinica || "",
        enderecoClinica: perfil.medico?.enderecoClinica || "",
        telefoneClinica: perfil.medico?.telefoneClinica || "",
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authApi.updateMedicoProfile({
        nome: formData.nome,
        telefone: formData.telefone || null,
        especialidade: formData.especialidade || null,
        nomeClinica: formData.nomeClinica || null,
        enderecoClinica: formData.enderecoClinica || null,
        telefoneClinica: formData.telefoneClinica || null,
      });

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      if (perfil) {
        setPerfil({
          ...perfil,
          nome: formData.nome,
          email: formData.email,
          medico: {
            ...perfil.medico,
            telefone: formData.telefone,
            especialidade: formData.especialidade,
            nomeClinica: formData.nomeClinica,
            enderecoClinica: formData.enderecoClinica,
            telefoneClinica: formData.telefoneClinica,
          },
        });
      }

      await refreshUserData();
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description:
          error.response?.data?.message ||
          "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header showNav={false} showProfile={true} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showNav={false} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/medico")}
              className="flex items-center gap-2 text-gray-600 hover:text-navy transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar ao Painel</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-navy">Meu Perfil</h1>
                <p className="text-gray-600 mt-1">
                  Visualize e edite suas informações pessoais
                </p>
              </div>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="gap-2"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="gap-2 bg-teal hover:bg-teal/90"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Dados Pessoais */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-teal" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  {isEditing ? (
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        handleInputChange("nome", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700 font-medium">
                      {perfil?.nome}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  {isEditing ? (
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="pl-10"
                        disabled // Email geralmente não pode ser alterado
                      />
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-700 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {perfil?.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  {isEditing ? (
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) =>
                          handleTelefoneChange("telefone", e.target.value)
                        }
                        placeholder="(00) 00000-0000"
                        className="pl-10"
                        maxLength={15}
                      />
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-700 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {perfil?.medico?.telefone || "Não informado"}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="especialidade">Especialidade</Label>
                  {isEditing ? (
                    <Select
                      value={formData.especialidade}
                      onValueChange={(value) =>
                        handleInputChange("especialidade", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione a especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESPECIALIDADES_MEDICAS.map((esp) => (
                          <SelectItem key={esp} value={esp}>
                            {esp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-gray-700 font-medium flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-gray-400" />
                      {perfil?.medico?.especialidade || "Não informada"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registro Profissional */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="w-5 h-5 text-teal" />
                Registro Profissional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>CRM</Label>
                  <p className="mt-1 text-gray-700 font-medium">
                    {perfil?.medico?.crm}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    O CRM não pode ser alterado
                  </p>
                </div>
                <div>
                  <Label>UF do CRM</Label>
                  <p className="mt-1 text-gray-700 font-medium">
                    {perfil?.medico?.ufCrm}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    A UF não pode ser alterada
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados da Clínica */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-teal" />
                Dados da Clínica / Consultório
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nomeClinica">Nome da Clínica</Label>
                {isEditing ? (
                  <Input
                    id="nomeClinica"
                    value={formData.nomeClinica}
                    onChange={(e) =>
                      handleInputChange("nomeClinica", e.target.value)
                    }
                    placeholder="Nome da clínica ou consultório"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-700 font-medium">
                    {perfil?.medico?.nomeClinica || "Não informado"}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="enderecoClinica">Endereço</Label>
                {isEditing ? (
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="enderecoClinica"
                      value={formData.enderecoClinica}
                      onChange={(e) =>
                        handleInputChange("enderecoClinica", e.target.value)
                      }
                      placeholder="Endereço completo"
                      className="pl-10"
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-gray-700 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {perfil?.medico?.enderecoClinica || "Não informado"}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="telefoneClinica">Telefone da Clínica</Label>
                {isEditing ? (
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="telefoneClinica"
                      value={formData.telefoneClinica}
                      onChange={(e) =>
                        handleTelefoneChange("telefoneClinica", e.target.value)
                      }
                      placeholder="(00) 0000-0000"
                      className="pl-10"
                      maxLength={15}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-gray-700 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {perfil?.medico?.telefoneClinica || "Não informado"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          {isEditing && (
            <div className="flex justify-end gap-4">
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="gap-2"
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="gap-2 bg-teal hover:bg-teal/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Alterações
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PerfilMedico;
