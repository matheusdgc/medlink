import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Search, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { adminApi } from "@/services/api";
import { toast } from "sonner";

// Tipos minimos necessarios para tipar a resposta da API
interface ReceitaAdmin {
  id: string;
  codigo: string;
  status: string;
  criadaEm: string;
  validadeAte: string;
  diagnostico?: string;
  paciente: { usuario: { nome: string } };
  medico: { usuario: { nome: string } };
  itens: { medicamento: string }[];
}

const STATUS_CORES: Record<string, string> = {
  ATIVA: "bg-green-100 text-green-700",
  DISPENSADA: "bg-blue-100 text-blue-700",
  VENCIDA: "bg-orange-100 text-orange-700",
  CANCELADA: "bg-red-100 text-red-700",
};

const GerenciarReceitas = () => {
  const [receitas, setReceitas] = useState<ReceitaAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);

  // Estado do dialogo de confirmacao de exclusao
  const [receitaParaApagar, setReceitaParaApagar] = useState<ReceitaAdmin | null>(null);
  const [apagando, setApagando] = useState(false);

  const carregarReceitas = useCallback(async () => {
    setCarregando(true);
    try {
      const params: Record<string, any> = {
        page: paginaAtual,
        limit: 15,
      };
      if (filtroStatus !== "TODOS") params.status = filtroStatus;
      if (busca.trim()) params.pacienteNome = busca.trim();

      const res = await adminApi.listarReceitas(params);
      const dados = res.data.data;
      setReceitas(dados.receitas);
      setTotalPaginas(dados.pagination.totalPages);
      setTotal(dados.pagination.total);
    } catch (err) {
      console.error("[GerenciarReceitas] Erro ao carregar receitas:", err);
      toast.error("Erro ao carregar receitas");
    } finally {
      setCarregando(false);
    }
  }, [paginaAtual, filtroStatus, busca]);

  useEffect(() => {
    const delay = setTimeout(carregarReceitas, 300);
    return () => clearTimeout(delay);
  }, [carregarReceitas]);

  const confirmarExclusao = (receita: ReceitaAdmin) => {
    setReceitaParaApagar(receita);
  };

  const executarExclusao = async () => {
    if (!receitaParaApagar) return;
    setApagando(true);
    try {
      await adminApi.deletarReceita(receitaParaApagar.id);
      toast.success(`Receita ${receitaParaApagar.codigo} removida permanentemente`);
      setReceitaParaApagar(null);
      carregarReceitas();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao apagar receita");
    } finally {
      setApagando(false);
    }
  };

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={false} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">

        {/* Cabecalho */}
        <div className="flex items-center gap-4">
          <BackButton to="/admin" label="Voltar ao painel" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Gerenciar Receitas
              </h1>
              <Badge className="bg-red-100 text-red-700 border-red-200">
                Admin
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Remoção permanente de receitas do banco de dados
            </p>
          </div>
        </div>

        {/* Aviso */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Atenção: ação irreversível</p>
            <p className="text-sm text-red-600 mt-0.5">
              Apagar uma receita remove permanentemente todos os dados relacionados
              (itens, dispensação). Esta ação não pode ser desfeita.
              Para apenas suspender uma receita, use a opção "Cancelar" disponível
              para médicos.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do paciente..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
              className="pl-9"
            />
          </div>
          <Select
            value={filtroStatus}
            onValueChange={(v) => { setFiltroStatus(v); setPaginaAtual(1); }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os status</SelectItem>
              <SelectItem value="ATIVA">Ativa</SelectItem>
              <SelectItem value="DISPENSADA">Dispensada</SelectItem>
              <SelectItem value="VENCIDA">Vencida</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contador */}
        {!carregando && (
          <p className="text-sm text-muted-foreground">
            {total} receita{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
          </p>
        )}

        {/* Tabela */}
        {carregando ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : receitas.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Nenhuma receita encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Código</th>
                  <th className="text-left p-3 font-medium">Paciente</th>
                  <th className="text-left p-3 font-medium">Médico</th>
                  <th className="text-left p-3 font-medium">Medicamentos</th>
                  <th className="text-left p-3 font-medium">Criada em</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {receitas.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {r.codigo.slice(0, 12)}...
                    </td>
                    <td className="p-3 font-medium">{r.paciente.usuario.nome}</td>
                    <td className="p-3 text-muted-foreground">{r.medico.usuario.nome}</td>
                    <td className="p-3 text-muted-foreground">
                      {r.itens.slice(0, 2).map((i) => i.medicamento).join(", ")}
                      {r.itens.length > 2 && ` +${r.itens.length - 2}`}
                    </td>
                    <td className="p-3 text-muted-foreground">{formatarData(r.criadaEm)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CORES[r.status] ?? ""}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => confirmarExclusao(r)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginacao */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual((p) => p + 1)}
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

      </main>

      <Footer />

      {/* Dialogo de confirmacao */}
      <AlertDialog
        open={!!receitaParaApagar}
        onOpenChange={(open) => { if (!open) setReceitaParaApagar(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Apagar receita permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Esta ação é irreversível. Os seguintes dados serão removidos:</p>
                {receitaParaApagar && (
                  <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                    <p><strong>Paciente:</strong> {receitaParaApagar.paciente.usuario.nome}</p>
                    <p><strong>Médico:</strong> {receitaParaApagar.medico.usuario.nome}</p>
                    <p><strong>Código:</strong> {receitaParaApagar.codigo}</p>
                    <p><strong>Status:</strong> {receitaParaApagar.status}</p>
                    <p><strong>Medicamentos:</strong>{" "}
                      {receitaParaApagar.itens.map((i) => i.medicamento).join(", ")}
                    </p>
                  </div>
                )}
                <p className="text-red-600 font-medium">
                  A dispensação associada (se houver) também será removida.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={apagando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executarExclusao}
              disabled={apagando}
              className="bg-red-600 hover:bg-red-700"
            >
              {apagando ? "Apagando..." : "Sim, apagar permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GerenciarReceitas;
