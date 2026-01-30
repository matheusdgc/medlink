import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Stethoscope,
  Pill,
  Heart,
  Wind,
  AlertTriangle,
} from "lucide-react";

interface AnamneseSectionProps {
  possuiAlergia: boolean;
  onPossuiAlergiaChange: (value: boolean) => void;
  alergias: string;
  onAlergiasChange: (value: string) => void;
  possuiAgravante: boolean;
  onPossuiAgravanteChange: (value: boolean) => void;
  agravantes: string[];
  onToggleAgravante: (agravante: string) => void;
  outraDoenca: string;
  onOutraDoencaChange: (value: string) => void;
}

interface AgravanteBotaoProps {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

function AgravanteBotao({ label, icon, selected, onClick }: AgravanteBotaoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
        selected
          ? "bg-teal text-white border-teal"
          : "bg-white border-teal/30 hover:border-teal"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export function AnamneseSection({
  possuiAlergia,
  onPossuiAlergiaChange,
  alergias,
  onAlergiasChange,
  possuiAgravante,
  onPossuiAgravanteChange,
  agravantes,
  onToggleAgravante,
  outraDoenca,
  onOutraDoencaChange,
}: AnamneseSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5" />
          Anamnese do Paciente
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Coloque as condições médicas do paciente
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alergias */}
        <div className="border border-teal/30 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Possui alguma alergia?
            </Label>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  possuiAlergia
                    ? "text-teal font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {possuiAlergia ? "Sim" : "Não"}
              </span>
              <Switch
                checked={possuiAlergia}
                onCheckedChange={onPossuiAlergiaChange}
                className="data-[state=checked]:bg-teal"
              />
            </div>
          </div>
          {possuiAlergia && (
            <Input
              placeholder="Quais alergias?"
              value={alergias}
              onChange={(e) => onAlergiasChange(e.target.value)}
              className="border-2"
            />
          )}
        </div>

        {/* Agravantes */}
        <div className="border border-teal/30 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Possui algum agravante?
            </Label>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  possuiAgravante
                    ? "text-teal font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {possuiAgravante ? "Sim" : "Não"}
              </span>
              <Switch
                checked={possuiAgravante}
                onCheckedChange={onPossuiAgravanteChange}
                className="data-[state=checked]:bg-teal"
              />
            </div>
          </div>
          {possuiAgravante && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <AgravanteBotao
                  label="Diabetes"
                  icon={<Pill className="w-8 h-8" />}
                  selected={agravantes.includes("Diabetes")}
                  onClick={() => onToggleAgravante("Diabetes")}
                />
                <AgravanteBotao
                  label="Hipertensão"
                  icon={<Heart className="w-8 h-8" />}
                  selected={agravantes.includes("Hipertensão")}
                  onClick={() => onToggleAgravante("Hipertensão")}
                />
                <AgravanteBotao
                  label="Asma"
                  icon={<Wind className="w-8 h-8" />}
                  selected={agravantes.includes("Asma")}
                  onClick={() => onToggleAgravante("Asma")}
                />
                <AgravanteBotao
                  label="Outra"
                  icon={<AlertTriangle className="w-8 h-8" />}
                  selected={agravantes.includes("Outra")}
                  onClick={() => onToggleAgravante("Outra")}
                />
              </div>
              {agravantes.includes("Outra") && (
                <Input
                  placeholder="Quais doenças?"
                  value={outraDoenca}
                  onChange={(e) => onOutraDoencaChange(e.target.value)}
                  className="border-2"
                />
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
