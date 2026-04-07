import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { ItemReceita } from "./types";

interface MedicamentosSectionProps {
  itens: ItemReceita[];
  onAdicionar: () => void;
  onRemover: (index: number) => void;
  onAtualizar: (index: number, campo: keyof ItemReceita, valor: string | number) => void;
}

interface ItemMedicamentoProps {
  item: ItemReceita;
  index: number;
  canRemove: boolean;
  onRemover: () => void;
  onAtualizar: (campo: keyof ItemReceita, valor: string | number) => void;
}

function ItemMedicamento({
  item,
  index,
  canRemove,
  onRemover,
  onAtualizar,
}: ItemMedicamentoProps) {
  return (
    <div className="border rounded-lg p-4 relative bg-slate-50">
      {canRemove && (
        <button
          onClick={onRemover}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700"
          aria-label={`Remover medicamento ${index + 1}`}
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
            onChange={(e) => onAtualizar("medicamento", e.target.value)}
          />
        </div>

        <div>
          <Label>Princípio Ativo</Label>
          <Input
            placeholder="Ex: Dipirona"
            value={item.principioAtivo}
            onChange={(e) => onAtualizar("principioAtivo", e.target.value)}
          />
        </div>

        <div>
          <Label>Forma Farmacêutica</Label>
          <Input
            placeholder="Ex: Comprimido, Cápsula"
            value={item.formaFarmaceutica}
            onChange={(e) => onAtualizar("formaFarmaceutica", e.target.value)}
          />
        </div>

        <div>
          <Label>Dosagem *</Label>
          <Input
            placeholder="Ex: 500mg"
            value={item.dosagem}
            onChange={(e) => onAtualizar("dosagem", e.target.value)}
          />
        </div>

        <div>
          <Label>Quantidade *</Label>
          <Input
            type="number"
            min={1}
            value={item.quantidade}
            onChange={(e) =>
              onAtualizar("quantidade", parseInt(e.target.value) || 1)
            }
          />
        </div>

        <div className="md:col-span-2">
          <Label>Posologia *</Label>
          <Input
            placeholder="Ex: Tomar 1 comprimido a cada 8 horas por 5 dias"
            value={item.posologia}
            onChange={(e) => onAtualizar("posologia", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Label>Observações do Item</Label>
          <Input
            placeholder="Observações específicas deste medicamento"
            value={item.observacao}
            onChange={(e) => onAtualizar("observacao", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export function MedicamentosSection({
  itens,
  onAdicionar,
  onRemover,
  onAtualizar,
}: MedicamentosSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Medicamentos</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onAdicionar}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {itens.map((item, index) => (
          <ItemMedicamento
            key={index}
            item={item}
            index={index}
            canRemove={itens.length > 1}
            onRemover={() => onRemover(index)}
            onAtualizar={(campo, valor) => onAtualizar(index, campo, valor)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
