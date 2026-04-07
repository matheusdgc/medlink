import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Plus, Loader2 } from "lucide-react";
import { NovoPacienteForm } from "./types";
import { formatCpf } from "./utils";

interface ModalCriarPacienteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  novoPaciente: NovoPacienteForm;
  onNovoPacienteChange: (value: NovoPacienteForm) => void;
  criando: boolean;
  onCriar: () => void;
}

export function ModalCriarPaciente({
  open,
  onOpenChange,
  novoPaciente,
  onNovoPacienteChange,
  criando,
  onCriar,
}: ModalCriarPacienteProps) {
  const updateField = <K extends keyof NovoPacienteForm>(
    field: K,
    value: NovoPacienteForm[K]
  ) => {
    onNovoPacienteChange({ ...novoPaciente, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Cadastrar Novo Paciente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            O paciente acessará o sistema usando apenas o CPF ou Cartão SUS.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campos Obrigatórios */}
            <div className="md:col-span-2">
              <Label>Nome Completo *</Label>
              <Input
                placeholder="Nome do paciente"
                value={novoPaciente.nome}
                onChange={(e) => updateField("nome", e.target.value)}
              />
            </div>

            <div>
              <Label>CPF *</Label>
              <Input
                placeholder="000.000.000-00"
                value={novoPaciente.cpf}
                onChange={(e) => updateField("cpf", formatCpf(e.target.value))}
              />
            </div>

            <div>
              <Label>Data de Nascimento *</Label>
              <Input
                type="date"
                value={novoPaciente.dataNascimento}
                onChange={(e) => updateField("dataNascimento", e.target.value)}
              />
            </div>

            <div>
              <Label>Sexo *</Label>
              <Select
                value={novoPaciente.sexo}
                onValueChange={(value) =>
                  updateField(
                    "sexo",
                    value as "MASCULINO" | "FEMININO" | "OUTRO"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Telefone *</Label>
              <Input
                placeholder="(00) 00000-0000"
                value={novoPaciente.telefone}
                onChange={(e) => updateField("telefone", e.target.value)}
              />
            </div>

            {/* Campos Opcionais */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <p className="text-sm text-muted-foreground mb-3">
                Campos opcionais
              </p>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={novoPaciente.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se informado, receberá notificações por email
              </p>
            </div>

            <div>
              <Label>Cartão SUS</Label>
              <Input
                placeholder="Numero do cartao SUS"
                value={novoPaciente.cartaoSus}
                onChange={(e) => updateField("cartaoSus", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label>PIN de Acesso (6 digitos)</Label>
              <Input
                type="password"
                inputMode="numeric"
                placeholder="------"
                maxLength={6}
                value={novoPaciente.pin}
                onChange={(e) =>
                  updateField("pin", e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="tracking-[0.5em] text-center"
              />
              <p className="text-xs text-muted-foreground mt-1">
                PIN numerico para o paciente acessar o sistema. Se nao informado, o login sera apenas por CPF + data de nascimento.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={onCriar}
              disabled={criando}
              className="flex-1 bg-navy hover:bg-navy-light"
            >
              {criando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Paciente
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
