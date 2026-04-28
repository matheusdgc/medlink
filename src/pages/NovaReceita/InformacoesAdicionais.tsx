import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcularDataValidade, formatarDataBR } from "./utils";

interface InformacoesAdicionaisProps {
  validadeDias: number;
  onValidadeDiasChange: (value: number) => void;
  diagnostico: string;
  onDiagnosticoChange: (value: string) => void;
  observacoes: string;
  onObservacoesChange: (value: string) => void;
}

export function InformacoesAdicionais({
  validadeDias,
  onValidadeDiasChange,
  diagnostico,
  onDiagnosticoChange,
  observacoes,
  onObservacoesChange,
}: InformacoesAdicionaisProps) {
  const dataValidade = calcularDataValidade(validadeDias);

  return (
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
            max={30}
            value={validadeDias}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 30;
              onValidadeDiasChange(Math.min(30, Math.max(1, v)));
            }}
            className="max-w-[150px]"
          />
          <p className="text-sm text-muted-foreground mt-1">
            A receita será válida até {formatarDataBR(dataValidade)} (máximo 30 dias)
          </p>
        </div>

        <div>
          <Label>Diagnóstico</Label>
          <Input
            placeholder="CID ou descrição do diagnóstico"
            value={diagnostico}
            onChange={(e) => onDiagnosticoChange(e.target.value)}
          />
        </div>

        <div>
          <Label>Observações Gerais</Label>
          <Textarea
            placeholder="Instruções adicionais para o paciente ou farmacêutico"
            value={observacoes}
            onChange={(e) => onObservacoesChange(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
