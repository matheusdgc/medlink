import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Search, Loader2 } from "lucide-react";
import { Paciente } from "./types";
import { formatCpf, formatarDataBR } from "./utils";

interface BuscaPacienteProps {
  cpfBusca: string;
  onCpfChange: (value: string) => void;
  buscando: boolean;
  paciente: Paciente | null;
  onBuscar: () => void;
  onLimpar: () => void;
  onAbrirModalCriar: () => void;
}

export function BuscaPaciente({
  cpfBusca,
  onCpfChange,
  buscando,
  paciente,
  onBuscar,
  onLimpar,
  onAbrirModalCriar,
}: BuscaPacienteProps) {
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCpfChange(formatCpf(e.target.value));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onBuscar();
  };

  return (
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
                  onChange={handleCpfChange}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button
                onClick={onBuscar}
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
                onClick={onAbrirModalCriar}
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
                {formatarDataBR(paciente.dataNascimento)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLimpar}
              className="text-green-700 hover:text-green-900"
            >
              Alterar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
