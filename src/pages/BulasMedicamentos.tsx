import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Pill,
  AlertTriangle,
  Clock,
  Droplets,
  FileText,
  ExternalLink,
  Sparkles,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { bulasApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const medicamentosBase = [
  {
    id: 1,
    nome: "Dipirona Sódica",
    principioAtivo: "Dipirona Monoidratada",
    classe: "Analgésico e Antipirético",
    apresentacoes: ["Comprimido 500mg", "Gotas 500mg/mL", "Solução Injetável"],
    indicacoes:
      "Dor de cabeça, dor de dente, dor muscular, cólicas, febre e estados gripais.",
    posologia:
      "Adultos: 1 a 2 comprimidos de 500mg, 3 a 4 vezes ao dia. Dose máxima: 4g/dia. Gotas: 20 a 40 gotas, 4 vezes ao dia.",
    contraindicacoes:
      "Hipersensibilidade à dipirona ou outros derivados pirazolônicos. Porfiria hepática aguda. Deficiência de G6PD. Primeiro e terceiro trimestres de gravidez.",
    efeitosColaterais:
      "Reações alérgicas cutâneas, agranulocitose (raro), hipotensão, náuseas.",
    interacoes:
      "Ciclosporina, metotrexato, lítio. Evitar uso com álcool. Pode potencializar efeito de anticoagulantes.",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da luz e umidade.",
    categoria: "Venda Livre",
    fonte: "local" as const,
  },
  {
    id: 2,
    nome: "Paracetamol",
    principioAtivo: "Paracetamol (Acetaminofeno)",
    classe: "Analgésico e Antipirético",
    apresentacoes: ["Comprimido 500mg", "Comprimido 750mg", "Gotas 200mg/mL"],
    indicacoes:
      "Dores leves a moderadas, febre, cefaleia, dores musculares e articulares.",
    posologia:
      "Adultos: 500mg a 1g a cada 4-6 horas. Dose máxima: 4g/dia. Crianças: 10-15mg/kg a cada 4-6 horas.",
    contraindicacoes:
      "Hipersensibilidade ao paracetamol. Doença hepática grave. Alcoolismo.",
    efeitosColaterais:
      "Reações alérgicas raras, hepatotoxicidade em doses elevadas, trombocitopenia (raro).",
    interacoes:
      "Varfarina (aumenta efeito anticoagulante), álcool (aumenta hepatotoxicidade), isoniazida.",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da luz.",
    categoria: "Venda Livre",
    fonte: "local" as const,
  },
  {
    id: 3,
    nome: "Ibuprofeno",
    principioAtivo: "Ibuprofeno",
    classe: "Anti-inflamatório Não Esteroidal (AINE)",
    apresentacoes: ["Comprimido 200mg", "Comprimido 400mg", "Comprimido 600mg"],
    indicacoes:
      "Dores inflamatórias, artrite, dor muscular, dor de dente, cólica menstrual, febre.",
    posologia:
      "Adultos: 200-400mg a cada 4-6 horas. Dose máxima: 1200mg/dia (automedicação) ou 2400mg/dia (prescrição médica).",
    contraindicacoes:
      "Úlcera gástrica ativa, insuficiência renal ou hepática grave, terceiro trimestre de gravidez, histórico de sangramento GI.",
    efeitosColaterais:
      "Dor de estômago, náuseas, azia, tontura, retenção de líquidos, risco cardiovascular aumentado em uso prolongado.",
    interacoes:
      "AAS (reduz efeito cardioprotetor), anticoagulantes, lítio, metotrexato, anti-hipertensivos.",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da umidade.",
    categoria: "Venda Livre",
    fonte: "local" as const,
  },
  {
    id: 4,
    nome: "Amoxicilina",
    principioAtivo: "Amoxicilina Tri-hidratada",
    classe: "Antibiótico - Penicilina",
    apresentacoes: [
      "Cápsula 500mg",
      "Suspensão 250mg/5mL",
      "Suspensão 500mg/5mL",
    ],
    indicacoes:
      "Infecções bacterianas do trato respiratório, urinário, pele, ouvido médio, sinusite, amigdalite.",
    posologia:
      "Adultos: 500mg a cada 8 horas ou 875mg a cada 12 horas por 7-14 dias. Crianças: 25-50mg/kg/dia divididos em 3 doses.",
    contraindicacoes:
      "Alergia a penicilinas ou cefalosporinas. Mononucleose infecciosa.",
    efeitosColaterais:
      "Diarreia, náuseas, erupções cutâneas, candidíase, reações alérgicas.",
    interacoes:
      "Alopurinol (aumenta risco de rash), anticoagulantes orais, metotrexato.",
    armazenamento:
      "Conservar em temperatura ambiente. Após reconstituição da suspensão, manter refrigerado por até 14 dias.",
    categoria: "Sob Prescrição",
    fonte: "local" as const,
  },
  {
    id: 5,
    nome: "Losartana Potássica",
    principioAtivo: "Losartana Potássica",
    classe: "Anti-hipertensivo - Antagonista AT1",
    apresentacoes: ["Comprimido 25mg", "Comprimido 50mg", "Comprimido 100mg"],
    indicacoes:
      "Hipertensão arterial, proteção renal em pacientes diabéticos tipo 2, insuficiência cardíaca.",
    posologia:
      "Hipertensão: Iniciar com 50mg/dia, podendo aumentar para 100mg/dia. Tomar preferencialmente no mesmo horário.",
    contraindicacoes:
      "Gravidez, lactação, hipersensibilidade ao medicamento, estenose bilateral de artéria renal.",
    efeitosColaterais:
      "Tontura, hipotensão, hipercalemia, tosse (menos comum que IECA), fadiga.",
    interacoes:
      "Suplementos de potássio, diuréticos poupadores de potássio, AINEs, lítio.",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da luz e umidade.",
    categoria: "Sob Prescrição",
    fonte: "local" as const,
  },
  {
    id: 6,
    nome: "Metformina",
    principioAtivo: "Cloridrato de Metformina",
    classe: "Antidiabético Oral - Biguanida",
    apresentacoes: ["Comprimido 500mg", "Comprimido 850mg", "Comprimido 1g XR"],
    indicacoes:
      "Diabetes mellitus tipo 2, resistência à insulina, síndrome dos ovários policísticos (off-label).",
    posologia:
      "Iniciar com 500mg 1-2x/dia durante refeições. Aumentar gradualmente. Dose máxima: 2550mg/dia divididos em 3 doses.",
    contraindicacoes:
      "Insuficiência renal grave (TFG < 30), acidose metabólica, insuficiência hepática grave, alcoolismo.",
    efeitosColaterais:
      "Náuseas, diarreia, dor abdominal, gosto metálico, deficiência de vitamina B12 (uso prolongado).",
    interacoes:
      "Contrastes iodados (suspender antes), álcool, medicamentos que afetam função renal.",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da umidade.",
    categoria: "Sob Prescrição",
    fonte: "local" as const,
  },
  {
    id: 7,
    nome: "Omeprazol",
    principioAtivo: "Omeprazol",
    classe: "Inibidor da Bomba de Prótons",
    apresentacoes: ["Cápsula 10mg", "Cápsula 20mg", "Cápsula 40mg"],
    indicacoes:
      "Úlcera gástrica e duodenal, refluxo gastroesofágico (DRGE), síndrome de Zollinger-Ellison, erradicação de H. pylori.",
    posologia:
      "20-40mg uma vez ao dia, 30 minutos antes do café da manhã. Tratamento geralmente por 4-8 semanas.",
    contraindicacoes:
      "Hipersensibilidade ao omeprazol ou benzimidazois substituídos.",
    efeitosColaterais:
      "Cefaleia, diarreia, dor abdominal, náuseas. Uso prolongado: deficiência de B12 e magnésio, risco de fraturas.",
    interacoes:
      "Clopidogrel (reduz eficácia), metotrexato, tacrolimus, antifúngicos azólicos.",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da luz e umidade.",
    categoria: "Venda Livre (10mg) / Sob Prescrição (20mg+)",
    fonte: "local" as const,
  },
  {
    id: 8,
    nome: "Loratadina",
    principioAtivo: "Loratadina",
    classe: "Anti-histamínico",
    apresentacoes: ["Comprimido 10mg", "Xarope 1mg/mL"],
    indicacoes:
      "Rinite alérgica, urticária, conjuntivite alérgica, reações alérgicas cutâneas.",
    posologia:
      "Adultos e crianças > 12 anos: 10mg uma vez ao dia. Crianças 2-12 anos: 5mg/dia.",
    contraindicacoes:
      "Hipersensibilidade à loratadina. Precaução em insuficiência hepática grave.",
    efeitosColaterais: "Sonolência (raro), boca seca, cefaleia, fadiga.",
    interacoes:
      "Cetoconazol, eritromicina (aumentam níveis plasmáticos), álcool.",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da luz.",
    categoria: "Venda Livre",
    fonte: "local" as const,
  },
  {
    id: 9,
    nome: "Sinvastatina",
    principioAtivo: "Sinvastatina",
    classe: "Hipolipemiante - Estatina",
    apresentacoes: ["Comprimido 10mg", "Comprimido 20mg", "Comprimido 40mg"],
    indicacoes:
      "Hipercolesterolemia, prevenção cardiovascular primária e secundária.",
    posologia:
      "Iniciar com 10-20mg/dia à noite. Dose máxima: 40mg/dia. Evitar dose de 80mg.",
    contraindicacoes: "Doença hepática ativa, gravidez, lactação, miopatia.",
    efeitosColaterais:
      "Dor muscular (mialgia), elevação de enzimas hepáticas, cefaleia, constipação. Raro: rabdomiólise.",
    interacoes:
      "Fibratos, niacina, amiodarona, verapamil, ciclosporina, antifúngicos azólicos, suco de grapefruit.",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da luz e umidade.",
    categoria: "Sob Prescrição",
    fonte: "local" as const,
  },
  {
    id: 10,
    nome: "Atenolol",
    principioAtivo: "Atenolol",
    classe: "Betabloqueador Cardiosseletivo",
    apresentacoes: ["Comprimido 25mg", "Comprimido 50mg", "Comprimido 100mg"],
    indicacoes:
      "Hipertensão arterial, angina de peito, arritmias, pós-infarto do miocárdio.",
    posologia:
      "Iniciar com 25-50mg/dia. Dose usual: 50-100mg/dia em dose única.",
    contraindicacoes:
      "Bradicardia grave, bloqueio AV de 2º e 3º grau, insuficiência cardíaca descompensada, asma grave.",
    efeitosColaterais:
      "Fadiga, extremidades frias, bradicardia, tontura, distúrbios do sono.",
    interacoes:
      "Verapamil, diltiazem, clonidina (não suspender abruptamente), insulina (mascara hipoglicemia).",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da luz.",
    categoria: "Sob Prescrição",
    fonte: "local" as const,
  },
  {
    id: 11,
    nome: "Azitromicina",
    principioAtivo: "Azitromicina Di-hidratada",
    classe: "Antibiótico - Macrolídeo",
    apresentacoes: ["Comprimido 500mg", "Suspensão 40mg/mL"],
    indicacoes:
      "Infecções respiratórias, otite média, sinusite, faringite, infecções de pele, ISTs.",
    posologia:
      "Adultos: 500mg/dia por 3 dias ou 500mg no 1º dia + 250mg por mais 4 dias. Tomar 1h antes ou 2h após refeições.",
    contraindicacoes:
      "Hipersensibilidade a macrolídeos, histórico de icterícia colestática.",
    efeitosColaterais:
      "Diarreia, náuseas, dor abdominal, vômitos, prolongamento do intervalo QT.",
    interacoes:
      "Antiácidos (reduzem absorção), varfarina, digoxina, ergotamina.",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da luz e umidade.",
    categoria: "Sob Prescrição",
    fonte: "local" as const,
  },
  {
    id: 12,
    nome: "Fluoxetina",
    principioAtivo: "Cloridrato de Fluoxetina",
    classe: "Antidepressivo - ISRS",
    apresentacoes: ["Cápsula 20mg", "Cápsula 40mg", "Solução 20mg/mL"],
    indicacoes:
      "Depressão, transtorno obsessivo-compulsivo, bulimia nervosa, transtorno do pânico.",
    posologia:
      "Iniciar com 20mg/dia pela manhã. Dose usual: 20-60mg/dia. Efeito terapêutico em 2-4 semanas.",
    contraindicacoes:
      "Uso concomitante de IMAO, hipersensibilidade à fluoxetina.",
    efeitosColaterais:
      "Náuseas, insônia, nervosismo, disfunção sexual, cefaleia, perda de apetite.",
    interacoes:
      "IMAOs (contraindicado), tramadol, triptanos, antipsicóticos, varfarina, lítio.",
    armazenamento:
      "Conservar em temperatura ambiente (15-30°C), protegido da luz.",
    categoria: "Sob Prescrição",
    fonte: "local" as const,
  },
];

type MedicamentoLocal = (typeof medicamentosBase)[0];

interface MedicamentoIA {
  id: string;
  nome: string;
  principioAtivo: string;
  classe: string;
  indicacoes: string;
  posologia: string;
  contraindicacoes: string;
  efeitosColaterais: string;
  interacoes: string;
  armazenamento: string;
  advertencias?: string;
  categoria: string;
  fonte: "IA";
  disclaimer?: string;
}

type Medicamento = MedicamentoLocal | MedicamentoIA;

const BulasMedicamentos = () => {
  const { toast } = useToast();
  const [busca, setBusca] = useState("");
  const [medicamentoSelecionado, setMedicamentoSelecionado] =
    useState<Medicamento | null>(null);
  const [buscandoIA, setBuscandoIA] = useState(false);

  const medicamentosFiltrados = medicamentosBase.filter(
    (med) =>
      med.nome.toLowerCase().includes(busca.toLowerCase()) ||
      med.principioAtivo.toLowerCase().includes(busca.toLowerCase()) ||
      med.classe.toLowerCase().includes(busca.toLowerCase())
  );

  const getCategoriaColor = (categoria: string) => {
    if (categoria.includes("Livre")) return "bg-green-100 text-green-800";
    if (categoria.includes("Prescrição")) return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-800";
  };

  const buscarComIA = async () => {
    if (!busca.trim() || busca.length < 2) {
      toast({
        title: "Digite o nome do medicamento",
        description: "Informe pelo menos 2 caracteres para buscar",
        variant: "destructive",
      });
      return;
    }

    setBuscandoIA(true);
    try {
      const response = await bulasApi.consultar(busca.trim());
      const data = response.data.data;

      const medicamentoIA: MedicamentoIA = {
        id: `ia-${Date.now()}`,
        nome: data.medicamento,
        principioAtivo: data.principioAtivo,
        classe: data.classe,
        indicacoes: data.indicacoes,
        posologia: data.posologia,
        contraindicacoes: data.contraindicacoes,
        efeitosColaterais: data.efeitosColaterais,
        interacoes: data.interacoes,
        armazenamento: data.armazenamento,
        advertencias: data.advertencias,
        categoria: "Consulte a bula",
        fonte: "IA",
        disclaimer: data.disclaimer,
      };

      setMedicamentoSelecionado(medicamentoIA);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Não foi possível consultar informações sobre este medicamento";
      toast({
        title: "Medicamento não encontrado",
        description: message,
        variant: "destructive",
      });
    } finally {
      setBuscandoIA(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      medicamentosFiltrados.length === 0 &&
      busca.trim()
    ) {
      buscarComIA();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Título e Busca */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Bulas de Medicamentos
            </h1>
            <p className="text-muted-foreground">
              Consulte informações sobre medicamentos
            </p>
            <Badge variant="outline" className="mt-2 gap-1">
              <Sparkles className="h-3 w-3" />
              Agora com consulta por IA
            </Badge>
          </div>

          {/* Campo de Busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar por nome, princípio ativo ou classe..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Botão de busca IA quando não encontra */}
          {busca.trim() && medicamentosFiltrados.length === 0 && (
            <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  <div>
                    <p className="font-medium text-foreground">
                      Não encontrado na base local
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Deseja consultar "{busca}" usando Inteligência Artificial?
                    </p>
                  </div>
                </div>
                <Button
                  onClick={buscarComIA}
                  disabled={buscandoIA}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
                >
                  {buscandoIA ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Buscar com IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Lista de Medicamentos ou Detalhes */}
          {medicamentoSelecionado ? (
            <div className="animate-fade-in">
              <Button
                variant="ghost"
                onClick={() => setMedicamentoSelecionado(null)}
                className="mb-4"
              >
                ← Voltar para lista
              </Button>

              <Card className="border-2">
                <CardHeader
                  className={`text-white rounded-t-lg ${
                    medicamentoSelecionado.fonte === "IA"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600"
                      : "bg-navy"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Pill className="h-6 w-6" />
                        {medicamentoSelecionado.nome}
                        {medicamentoSelecionado.fonte === "IA" && (
                          <Badge className="bg-white/20 text-white text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-white/80 mt-1">
                        {medicamentoSelecionado.principioAtivo}
                      </p>
                    </div>
                    <Badge
                      className={getCategoriaColor(
                        medicamentoSelecionado.categoria
                      )}
                    >
                      {medicamentoSelecionado.categoria}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Disclaimer para IA */}
                  {medicamentoSelecionado.fonte === "IA" && (
                    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-800 flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Informação gerada por IA:</strong>{" "}
                          {(medicamentoSelecionado as MedicamentoIA)
                            .disclaimer ||
                            "Sempre consulte a bula oficial e um profissional de saúde."}
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <Badge variant="outline" className="mr-2">
                      {medicamentoSelecionado.classe}
                    </Badge>
                  </div>

                  {"apresentacoes" in medicamentoSelecionado && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        Apresentações disponíveis:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(
                          medicamentoSelecionado as MedicamentoLocal
                        ).apresentacoes.map((ap, i) => (
                          <Badge key={i} variant="secondary">
                            {ap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="indicacoes">
                      <AccordionTrigger className="text-left">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-teal" />
                          Indicações
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {medicamentoSelecionado.indicacoes}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="posologia">
                      <AccordionTrigger className="text-left">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-teal" />
                          Posologia (Como usar)
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {medicamentoSelecionado.posologia}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="contraindicacoes">
                      <AccordionTrigger className="text-left">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Contraindicações
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {medicamentoSelecionado.contraindicacoes}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="efeitos">
                      <AccordionTrigger className="text-left">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          Efeitos Colaterais
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {medicamentoSelecionado.efeitosColaterais}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="interacoes">
                      <AccordionTrigger className="text-left">
                        <span className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-purple-500" />
                          Interações Medicamentosas
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {medicamentoSelecionado.interacoes}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="armazenamento">
                      <AccordionTrigger className="text-left">
                        <span className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          Armazenamento
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {medicamentoSelecionado.armazenamento}
                      </AccordionContent>
                    </AccordionItem>

                    {"advertencias" in medicamentoSelecionado &&
                      medicamentoSelecionado.advertencias && (
                        <AccordionItem value="advertencias">
                          <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                              <ShieldAlert className="h-4 w-4 text-red-600" />
                              Advertências
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {
                              (medicamentoSelecionado as MedicamentoIA)
                                .advertencias
                            }
                          </AccordionContent>
                        </AccordionItem>
                      )}
                  </Accordion>

                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Atenção:</strong> Esta é uma informação
                        resumida. Sempre leia a bula completa que acompanha o
                        medicamento e consulte seu médico ou farmacêutico em
                        caso de dúvidas.
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 text-center">
                    <a
                      href="https://consultas.anvisa.gov.br/#/bulario/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-teal hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Consultar bula completa na ANVISA
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Grid de Medicamentos */}
              {busca && medicamentosFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Medicamento não encontrado na base local
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use o botão "Buscar com IA" acima para consultar
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {(busca ? medicamentosFiltrados : medicamentosBase).map(
                    (med) => (
                      <Card
                        key={med.id}
                        className="cursor-pointer hover:border-teal transition-colors animate-fade-in"
                        onClick={() => setMedicamentoSelecionado(med)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Pill className="h-4 w-4 text-teal" />
                                {med.nome}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {med.principioAtivo}
                              </p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {med.classe}
                              </Badge>
                            </div>
                            <Badge
                              className={`${getCategoriaColor(
                                med.categoria
                              )} text-xs`}
                            >
                              {med.categoria.includes("Livre")
                                ? "Venda Livre"
                                : "Prescrição"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              )}

              {/* Link para ANVISA */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Não encontrou o medicamento que procura?
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={buscarComIA}
                    disabled={!busca.trim() || buscandoIA}
                    className="gap-2"
                  >
                    {buscandoIA ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Buscar com IA
                  </Button>
                  <a
                    href="https://consultas.anvisa.gov.br/#/bulario/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-teal hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Consultar Bulário Eletrônico da ANVISA
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BulasMedicamentos;
