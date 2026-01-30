import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  User,
  Stethoscope,
  Pill,
  AlertTriangle,
} from "lucide-react";
import { Paciente, ItemReceita } from "./types";
import { calcularDataValidade, formatarDataBR } from "./utils";

interface ConferenciaReceitaProps {
  // Dados do paciente
  paciente: Paciente;
  
  // Anamnese
  possuiAlergia: boolean;
  alergias: string;
  possuiAgravante: boolean;
  agravantes: string[];
  outraDoenca: string;
  
  // Medicamentos
  itens: ItemReceita[];
  
  // Informações adicionais
  validadeDias: number;
  diagnostico: string;
  observacoes: string;
  
  // Ações
  enviando: boolean;
  onVoltar: () => void;
  onConfirmar: () => void;
}

export function ConferenciaReceita({
  paciente,
  possuiAlergia,
  alergias,
  possuiAgravante,
  agravantes,
  outraDoenca,
  itens,
  validadeDias,
  diagnostico,
  observacoes,
  enviando,
  onVoltar,
  onConfirmar,
}: ConferenciaReceitaProps) {
  const dataValidade = calcularDataValidade(validadeDias);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onVoltar}
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
                onClick={onVoltar}
                className="text-teal"
              >
                Editar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-semibold text-lg">{paciente.usuario.nome}</p>
                <p className="text-muted-foreground">
                  CPF: {paciente.cpf} • Nascimento:{" "}
                  {formatarDataBR(paciente.dataNascimento)}
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
                  onClick={onVoltar}
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
                      <p className="font-medium text-orange-700">Agravantes:</p>
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
                onClick={onVoltar}
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
                        <span className="text-muted-foreground">Dosagem:</span>{" "}
                        {item.dosagem}
                      </p>
                      {item.formaFarmaceutica && (
                        <p>
                          <span className="text-muted-foreground">Forma:</span>{" "}
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
                onClick={onVoltar}
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
                    {validadeDias} dias (até {formatarDataBR(dataValidade)})
                  </p>
                </div>
                {diagnostico && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Diagnóstico</p>
                    <p className="font-semibold">{diagnostico}</p>
                  </div>
                )}
                {observacoes && (
                  <div className="bg-slate-50 rounded-lg p-4 md:col-span-2">
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="font-semibold">{observacoes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={onVoltar}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar e Editar
            </Button>
            <Button
              onClick={onConfirmar}
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
