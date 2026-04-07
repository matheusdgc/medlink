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
  Building2,
  MapPin,
  Edit2,
  Save,
  X,
  Loader2,
  Pill,
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

interface PerfilFarmacia {
  id: string;
  email: string;
  nome: string;
  tipo: string;
  farmacia: {
    id: string;
    cnpj: string;
    crf: string;
    ufCrf: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    telefone: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
  };
}

const PerfilFarmacia = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUserData } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [perfil, setPerfil] = useState<PerfilFarmacia | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    nomeFantasia: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
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
        telefone: data.farmacia?.telefone || "",
        nomeFantasia: data.farmacia?.nomeFantasia || "",
        endereco: data.farmacia?.endereco || "",
        cidade: data.farmacia?.cidade || "",
        estado: data.farmacia?.estado || "",
        cep: data.farmacia?.cep || "",
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

  const formatarCep = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/(\d{5})(\d{0,3})/, "$1-$2");
  };

  const handleTelefoneChange = (value: string) => {
    const formatted = formatarTelefone(value);
    setFormData((prev) => ({ ...prev, telefone: formatted }));
  };

  const handleCepChange = (value: string) => {
    const formatted = formatarCep(value);
    setFormData((prev) => ({ ...prev, cep: formatted }));
  };

  const handleCancelEdit = () => {
    if (perfil) {
      setFormData({
        nome: perfil.nome || "",
        email: perfil.email || "",
        telefone: perfil.farmacia?.telefone || "",
        nomeFantasia: perfil.farmacia?.nomeFantasia || "",
        endereco: perfil.farmacia?.endereco || "",
        cidade: perfil.farmacia?.cidade || "",
        estado: perfil.farmacia?.estado || "",
        cep: perfil.farmacia?.cep || "",
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authApi.updateFarmaciaProfile({
        nome: formData.nome,
        telefone: formData.telefone || null,
        nomeFantasia: formData.nomeFantasia || null,
        endereco: formData.endereco || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        cep: formData.cep || null,
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
          farmacia: {
            ...perfil.farmacia,
            telefone: formData.telefone,
            nomeFantasia: formData.nomeFantasia,
            endereco: formData.endereco,
            cidade: formData.cidade,
            estado: formData.estado,
            cep: formData.cep,
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
              onClick={() => navigate("/farmacia")}
              className="flex items-center gap-2 text-gray-600 hover:text-navy transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar ao Painel</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-navy">Meu Perfil</h1>
                <p className="text-gray-600 mt-1">
                  Visualize e edite suas informações
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

          {/* Dados do Responsável */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-teal" />
                Dados do Responsável
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
                        className="pl-10"
                        disabled
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
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                {isEditing ? (
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleTelefoneChange(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="pl-10"
                      maxLength={15}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-gray-700 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {perfil?.farmacia?.telefone || "Não informado"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Registro Profissional */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="w-5 h-5 text-teal" />
                Registro Profissional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>CRF</Label>
                  <p className="mt-1 text-gray-700 font-medium">
                    {perfil?.farmacia?.crf}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    O CRF não pode ser alterado
                  </p>
                </div>
                <div>
                  <Label>UF do CRF</Label>
                  <p className="mt-1 text-gray-700 font-medium">
                    {perfil?.farmacia?.ufCrf}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    A UF não pode ser alterada
                  </p>
                </div>
              </div>
              <div>
                <Label>CNPJ</Label>
                <p className="mt-1 text-gray-700 font-medium">
                  {perfil?.farmacia?.cnpj}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  O CNPJ não pode ser alterado
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dados da Farmácia */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-teal" />
                Dados da Farmácia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Razão Social</Label>
                <p className="mt-1 text-gray-700 font-medium">
                  {perfil?.farmacia?.razaoSocial}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  A razão social não pode ser alterada
                </p>
              </div>
              <div>
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                {isEditing ? (
                  <Input
                    id="nomeFantasia"
                    value={formData.nomeFantasia}
                    onChange={(e) =>
                      handleInputChange("nomeFantasia", e.target.value)
                    }
                    placeholder="Nome fantasia da farmácia"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-700 font-medium">
                    {perfil?.farmacia?.nomeFantasia || "Não informado"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-teal" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="endereco">Endereço Completo</Label>
                {isEditing ? (
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) =>
                        handleInputChange("endereco", e.target.value)
                      }
                      placeholder="Rua, número, bairro"
                      className="pl-10"
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-gray-700 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {perfil?.farmacia?.endereco || "Não informado"}
                  </p>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  {isEditing ? (
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) =>
                        handleInputChange("cidade", e.target.value)
                      }
                      placeholder="Cidade"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700 font-medium">
                      {perfil?.farmacia?.cidade || "Não informada"}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  {isEditing ? (
                    <Select
                      value={formData.estado}
                      onValueChange={(value) =>
                        handleInputChange("estado", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BRASIL.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-gray-700 font-medium">
                      {perfil?.farmacia?.estado || "Não informado"}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  {isEditing ? (
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      className="mt-1"
                      maxLength={9}
                    />
                  ) : (
                    <p className="mt-1 text-gray-700 font-medium">
                      {perfil?.farmacia?.cep || "Não informado"}
                    </p>
                  )}
                </div>
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

export default PerfilFarmacia;
