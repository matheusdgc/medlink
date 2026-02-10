import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  ArrowLeft,
  MapPin,
  Phone,
  Building2,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  unidadesSaudeApi,
  CriarUnidadeSaudeData,
  AtualizarUnidadeSaudeData,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UnidadeSaude {
  id: string;
  nome: string;
  tipo: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string | null;
  telefone: string | null;
  latitude: number | null;
  longitude: number | null;
  ativo: boolean;
}

const TIPOS_UNIDADE = [
  "UBS",
  "Hospital",
  "Clínica",
  "Farmácia",
  "Pronto Socorro",
  "UPA",
];

const ESTADOS_BR = [
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

const tipoConfig: Record<string, { label: string; color: string }> = {
  UBS: { label: "UBS", color: "bg-green-500" },
  Hospital: { label: "Hospital", color: "bg-red-500" },
  Clínica: { label: "Clínica", color: "bg-blue-500" },
  Farmácia: { label: "Farmácia", color: "bg-purple-500" },
  "Pronto Socorro": { label: "Pronto Socorro", color: "bg-orange-500" },
  UPA: { label: "UPA", color: "bg-yellow-600" },
};

const AdminUnidadesSaude = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [unidades, setUnidades] = useState<UnidadeSaude[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editandoUnidade, setEditandoUnidade] = useState<UnidadeSaude | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CriarUnidadeSaudeData>({
    nome: "",
    tipo: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    telefone: "",
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [unidadeParaExcluir, setUnidadeParaExcluir] =
    useState<UnidadeSaude | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    carregarUnidades();
  }, []);

  const carregarUnidades = async () => {
    setIsLoading(true);
    try {
      const response = await unidadesSaudeApi.listar({ limit: 100 });
      setUnidades(response.data.data.unidades || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar unidades",
        description: error.response?.data?.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const abrirFormulario = (unidade?: UnidadeSaude) => {
    if (unidade) {
      setEditandoUnidade(unidade);
      setFormData({
        nome: unidade.nome,
        tipo: unidade.tipo,
        endereco: unidade.endereco,
        cidade: unidade.cidade,
        estado: unidade.estado,
        cep: unidade.cep || "",
        telefone: unidade.telefone || "",
        latitude: unidade.latitude || undefined,
        longitude: unidade.longitude || undefined,
      });
    } else {
      setEditandoUnidade(null);
      setFormData({
        nome: "",
        tipo: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        telefone: "",
      });
    }
    setShowFormDialog(true);
  };

  const salvarUnidade = async () => {
    if (
      !formData.nome ||
      !formData.tipo ||
      !formData.endereco ||
      !formData.cidade ||
      !formData.estado
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editandoUnidade) {
        await unidadesSaudeApi.atualizar(
          editandoUnidade.id,
          formData as AtualizarUnidadeSaudeData
        );
        toast({
          title: "Unidade atualizada!",
          description: "A unidade de saúde foi atualizada com sucesso.",
        });
      } else {
        await unidadesSaudeApi.criar(formData);
        toast({
          title: "Unidade criada!",
          description: "A unidade de saúde foi cadastrada com sucesso.",
        });
      }

      setShowFormDialog(false);
      carregarUnidades();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.response?.data?.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmarExclusao = (unidade: UnidadeSaude) => {
    setUnidadeParaExcluir(unidade);
    setShowDeleteDialog(true);
  };

  const excluirUnidade = async () => {
    if (!unidadeParaExcluir) return;

    setIsDeleting(true);

    try {
      await unidadesSaudeApi.excluir(unidadeParaExcluir.id);
      toast({
        title: "Unidade desativada!",
        description: "A unidade de saúde foi desativada com sucesso.",
      });
      setShowDeleteDialog(false);
      carregarUnidades();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.response?.data?.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const unidadesFiltradas = unidades.filter((u) => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      u.nome.toLowerCase().includes(termo) ||
      u.cidade.toLowerCase().includes(termo) ||
      u.tipo.toLowerCase().includes(termo)
    );
  });

  const dashboardRoute = user?.tipo === "MEDICO" ? "/medico" : "/farmacia";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button
            onClick={() => navigate(dashboardRoute)}
            className="hover:text-teal transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <span>/</span>
          <span className="text-foreground">Gerenciar Unidades de Saúde</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-navy">
              Gerenciar Unidades de Saúde
            </h1>
            <p className="text-muted-foreground">
              Cadastre e gerencie unidades de saúde do sistema
            </p>
          </div>
          <Button
            onClick={() => abrirFormulario()}
            className="bg-teal hover:bg-teal-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Unidade
          </Button>
        </div>

        {/* Busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, cidade ou tipo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Lista de Unidades */}
        {!isLoading && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {unidadesFiltradas.length} unidade
              {unidadesFiltradas.length !== 1 ? "s" : ""} encontrada
              {unidadesFiltradas.length !== 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unidadesFiltradas.map((unidade) => (
                <Card
                  key={unidade.id}
                  className={`hover:shadow-card transition-shadow ${
                    !unidade.ativo ? "opacity-50" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        className={`${
                          tipoConfig[unidade.tipo]?.color || "bg-gray-500"
                        } text-white`}
                      >
                        {tipoConfig[unidade.tipo]?.label || unidade.tipo}
                      </Badge>
                      {!unidade.ativo && (
                        <Badge
                          variant="outline"
                          className="text-red-500 border-red-500"
                        >
                          Inativo
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-foreground mb-2">
                      {unidade.nome}
                    </h3>

                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{unidade.endereco}</span>
                    </p>

                    <p className="text-sm text-muted-foreground mb-1">
                      {unidade.cidade} - {unidade.estado}
                    </p>

                    {unidade.telefone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {unidade.telefone}
                      </p>
                    )}

                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => abrirFormulario(unidade)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-500 hover:bg-red-50"
                        onClick={() => confirmarExclusao(unidade)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {!isLoading && unidadesFiltradas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Nenhuma unidade encontrada</p>
            <p className="text-sm mt-1">
              {busca
                ? "Tente outro termo de busca"
                : "Clique em 'Nova Unidade' para cadastrar"}
            </p>
          </div>
        )}
      </main>

      {/* Dialog de Formulário */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editandoUnidade
                ? "Editar Unidade de Saúde"
                : "Nova Unidade de Saúde"}
            </DialogTitle>
            <DialogDescription>
              {editandoUnidade
                ? "Atualize as informações da unidade de saúde"
                : "Preencha os dados para cadastrar uma nova unidade"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Ex: UBS Central"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_UNIDADE.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço *</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) =>
                  setFormData({ ...formData, endereco: e.target.value })
                }
                placeholder="Ex: Rua das Flores, 100 - Centro"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) =>
                    setFormData({ ...formData, cidade: e.target.value })
                  }
                  placeholder="Ex: Itapeva"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) =>
                    setFormData({ ...formData, estado: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BR.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) =>
                    setFormData({ ...formData, cep: e.target.value })
                  }
                  placeholder="00000-000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  placeholder="(00) 0000-0000"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFormDialog(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarUnidade}
              disabled={isSaving}
              className="bg-teal hover:bg-teal-dark"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : editandoUnidade ? (
                "Atualizar"
              ) : (
                "Cadastrar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar unidade de saúde?</AlertDialogTitle>
            <AlertDialogDescription>
              A unidade "{unidadeParaExcluir?.nome}" será desativada e não
              aparecerá mais nas buscas. Esta ação pode ser revertida editando a
              unidade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={excluirUnidade}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Desativando...
                </>
              ) : (
                "Desativar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default AdminUnidadesSaude;
