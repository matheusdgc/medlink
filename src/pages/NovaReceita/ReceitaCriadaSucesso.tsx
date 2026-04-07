import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle } from "lucide-react";

interface ReceitaCriadaSucessoProps {
  codigoReceita: string;
  onNovareceita: () => void;
}

export function ReceitaCriadaSucesso({
  codigoReceita,
  onNovareceita,
}: ReceitaCriadaSucessoProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Receita Criada!</h2>
            <p className="text-muted-foreground mb-4">
              A receita foi criada com sucesso.
            </p>

            <div className="bg-slate-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">
                Código da Receita
              </p>
              <p className="text-2xl font-mono font-bold text-navy">
                {codigoReceita}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={onNovareceita}
                className="w-full bg-navy hover:bg-navy-light"
              >
                Criar Nova Receita
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/medico")}
                className="w-full"
              >
                Voltar ao Painel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
