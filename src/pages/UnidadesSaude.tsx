import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Building2,
  Search,
  Navigation,
  Loader2,
} from "lucide-react";
import { unidadesSaudeApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

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
}

interface EnderecoInfo {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

const formatCep = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  const limited = numbers.slice(0, 8);

  if (limited.length <= 5) {
    return limited;
  }
  return `${limited.slice(0, 5)}-${limited.slice(5)}`;
};

const tipoConfig: Record<string, { label: string; color: string }> = {
  UBS: { label: "UBS", color: "bg-green-500" },
  Hospital: { label: "Hospital", color: "bg-red-500" },
  Clínica: { label: "Clínica", color: "bg-blue-500" },
  Farmácia: { label: "Farmácia", color: "bg-purple-500" },
  "Pronto Socorro": { label: "Pronto Socorro", color: "bg-orange-500" },
  UPA: { label: "UPA", color: "bg-yellow-600" },
};

const UnidadesSaude = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cep, setCep] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [unidades, setUnidades] = useState<UnidadeSaude[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [endereco, setEndereco] = useState<EnderecoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTipos, setIsLoadingTipos] = useState(true);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  useEffect(() => {
    carregarTipos();
  }, []);

  const carregarTipos = async () => {
    try {
      const response = await unidadesSaudeApi.listarTipos();
      setTipos(response.data.data || []);
    } catch (error) {
      console.error("Erro ao carregar tipos:", error);
    } finally {
      setIsLoadingTipos(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCep(e.target.value));
  };

  const buscarUnidades = async () => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      toast({
        title: "CEP inválido",
        description: "Digite um CEP válido com 8 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setBuscaRealizada(true);

    try {
      const response = await unidadesSaudeApi.buscarPorCep(cepLimpo, {
        tipo: tipoFiltro !== "todos" ? tipoFiltro : undefined,
      });

      const data = response.data.data;
      setUnidades(data.unidades || []);
      setEndereco(data.endereco || null);

      if (!data.endereco) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP digitado está correto.",
          variant: "destructive",
        });
      } else if (data.unidades.length === 0) {
        toast({
          title: "Nenhuma unidade encontrada",
          description: `Não encontramos unidades de saúde em ${data.endereco.cidade}/${data.endereco.estado}.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro na busca",
        description:
          error.response?.data?.message ||
          "Não foi possível buscar as unidades de saúde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const abrirMapa = (unidade: UnidadeSaude) => {
    const enderecoCompleto = `${unidade.endereco}, ${unidade.cidade} - ${unidade.estado}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      enderecoCompleto
    )}`;
    window.open(url, "_blank");
  };

  const ligarTelefone = (telefone: string) => {
    window.open(`tel:${telefone}`, "_self");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button
            onClick={() => navigate("/paciente")}
            className="hover:text-teal transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <span>/</span>
          <span className="text-foreground">Unidades de Saúde</span>
        </div>

        <h1 className="text-2xl font-display font-bold text-navy mb-2">
          Encontrar Unidades de Saúde
        </h1>
        <p className="text-muted-foreground mb-6">
          Digite seu CEP para encontrar postos de saúde, hospitais e farmácias
          próximos
        </p>

        {/* Formulário de Busca */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={cep}
                  onChange={handleCepChange}
                  className="mt-1"
                  maxLength={9}
                />
              </div>

              <div className="md:col-span-1">
                <Label htmlFor="tipo">Tipo de Unidade</Label>
                <Select
                  value={tipoFiltro}
                  onValueChange={setTipoFiltro}
                  disabled={isLoadingTipos}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {tipos.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1 flex items-end">
                <Button
                  onClick={buscarUnidades}
                  disabled={isLoading || cep.replace(/\D/g, "").length < 8}
                  className="w-full bg-teal hover:bg-teal-dark"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço Encontrado */}
        {endereco && (
          <div className="mb-6 p-4 bg-teal-light rounded-lg border border-teal/20">
            <div className="flex items-center gap-2 text-teal font-medium mb-1">
              <MapPin className="w-4 h-4" />
              Buscando próximo a:
            </div>
            <p className="text-gray-700">
              {endereco.bairro && `${endereco.bairro}, `}
              {endereco.cidade} - {endereco.estado}
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-64 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Lista de Unidades */}
        {!isLoading && buscaRealizada && (
          <div className="space-y-4">
            {unidades.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {unidades.length} unidade{unidades.length !== 1 ? "s" : ""}{" "}
                encontrada{unidades.length !== 1 ? "s" : ""}
              </p>
            )}

            {unidades.map((unidade, index) => (
              <Card
                key={unidade.id}
                className="animate-fade-in hover:shadow-card transition-shadow"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-teal" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {unidade.nome}
                        </h3>
                        <Badge
                          className={`${
                            tipoConfig[unidade.tipo]?.color || "bg-gray-500"
                          } text-white flex-shrink-0`}
                        >
                          {tipoConfig[unidade.tipo]?.label || unidade.tipo}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{unidade.endereco}</span>
                      </p>

                      <p className="text-sm text-muted-foreground mb-3">
                        {unidade.cidade} - {unidade.estado}
                        {unidade.cep && ` • CEP: ${unidade.cep}`}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirMapa(unidade)}
                          className="text-teal border-teal hover:bg-teal hover:text-white"
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          Ver no Mapa
                        </Button>

                        {unidade.telefone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => ligarTelefone(unidade.telefone!)}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            {unidade.telefone}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estado Inicial */}
        {!isLoading && !buscaRealizada && (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Digite seu CEP para começar</p>
            <p className="text-sm mt-1">
              Encontraremos unidades de saúde próximas a você
            </p>
          </div>
        )}

        {/* Nenhuma Unidade Encontrada */}
        {!isLoading && buscaRealizada && unidades.length === 0 && endereco && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Nenhuma unidade encontrada</p>
            <p className="text-sm mt-1">
              Não encontramos unidades de saúde cadastradas em {endereco.cidade}
            </p>
            <p className="text-sm">
              Tente buscar com outro CEP ou remova o filtro de tipo
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UnidadesSaude;
