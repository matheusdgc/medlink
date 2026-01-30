import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MedLinkLogo } from "@/components/MedLinkLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formatCpf = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  const limited = numbers.slice(0, 11);

  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(
      6,
      9
    )}-${limited.slice(9)}`;
  }
};

const LoginPaciente = () => {
  const navigate = useNavigate();
  const { loginPaciente, isLoading } = useAuth();
  const [cpfSus, setCpfSus] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    setCpfSus(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cpfSus.trim() || !dataNascimento) {
      return;
    }

    try {
      await loginPaciente({ cpfOuCartaoSus: cpfSus, dataNascimento });
      navigate("/paciente");
    } catch (error) {
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjQwIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI3BhdHRlcm4pIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-navy/70 hover:text-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar</span>
        </button>

        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <MedLinkLogo size="xl" />
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8 animate-scale-in">
          <h2 className="font-display text-2xl font-bold text-center text-foreground mb-8">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cpf-sus" className="text-muted-foreground">
                CPF ou Cartão SUS
              </Label>
              <Input
                id="cpf-sus"
                type="text"
                value={cpfSus}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                className="h-14 text-lg border-2 border-border focus:border-teal rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="data-nascimento"
                className="text-muted-foreground"
              >
                Data de Nascimento
              </Label>
              <Input
                id="data-nascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="h-14 text-lg border-2 border-border focus:border-teal rounded-xl"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-navy data-[state=checked]:bg-navy data-[state=checked]:border-navy"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Lembre-se de mim
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !cpfSus.trim() || !dataNascimento}
              className="w-full h-14 text-lg font-semibold bg-navy hover:bg-navy-light text-white rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "ACESSAR"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPaciente;
