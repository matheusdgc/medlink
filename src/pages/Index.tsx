import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Stethoscope, Pill, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const isMedico = isAuthenticated && user?.tipo === "MEDICO";
  const isFarmacia = isAuthenticated && user?.tipo === "FARMACIA";

  const handleMedicoClick = () => {
    if (isFarmacia) return;
    if (isMedico) {
      navigate("/medico");
    } else {
      navigate("/login/profissional?tipo=medico");
    }
  };

  const handleFarmaciaClick = () => {
    if (isMedico) return;
    if (isFarmacia) {
      navigate("/farmacia");
    } else {
      navigate("/login/profissional?tipo=farmacia");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Cards de seleção à esquerda */}
            <div className="flex flex-col gap-6 w-full lg:w-auto">
              {/* Card Médico */}
              <button
                onClick={handleMedicoClick}
                disabled={isFarmacia}
                className={`group flex flex-col items-center p-8 bg-white border-2 rounded-xl shadow-sm transition-all duration-200 w-full lg:w-64 relative ${
                  isFarmacia
                    ? "border-gray-200 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-teal hover:shadow-md"
                }`}
              >
                {isFarmacia && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${
                    isFarmacia ? "bg-gray-300" : "bg-teal group-hover:scale-110"
                  }`}
                >
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-navy mb-2">Médico</h2>
                <p className="text-gray-500 text-center text-sm">
                  {isMedico ? "Acessar painel médico" : "Se você for médico"}
                </p>
              </button>

              {/* Card Farmacêutico */}
              <button
                onClick={handleFarmaciaClick}
                disabled={isMedico}
                className={`group flex flex-col items-center p-8 bg-white border-2 rounded-xl shadow-sm transition-all duration-200 w-full lg:w-64 relative ${
                  isMedico
                    ? "border-gray-200 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-teal hover:shadow-md"
                }`}
              >
                {isMedico && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${
                    isMedico ? "bg-gray-300" : "bg-teal group-hover:scale-110"
                  }`}
                >
                  <Pill className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-navy mb-2">
                  Farmacêutico
                </h2>
                <p className="text-gray-500 text-center text-sm">
                  {isFarmacia
                    ? "Acessar painel farmacêutico"
                    : "Se você for farmacêutico"}
                </p>
              </button>
            </div>

            {/* Imagem à direita */}
            <div className="flex-1 w-full lg:w-auto">
              <img
                src="/images/imagem-tela-selecao.png"
                alt="Ambiente hospitalar"
                className="w-full h-auto rounded-2xl shadow-lg object-cover max-h-[500px]"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
