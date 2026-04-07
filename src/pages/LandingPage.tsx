import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MedLinkLogo } from "@/components/MedLinkLogo";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  FileText,
  QrCode,
  Shield,
  Clock,
  Users,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  Pill,
  Smartphone,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/servicos") {
      document
        .getElementById("servicos")
        ?.scrollIntoView({ behavior: "smooth" });
    } else if (path === "/sobre") {
      document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" });
    } else if (path === "/contato") {
      document
        .getElementById("contato")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy/90 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <MedLinkLogo
              variant="white"
              size="xl"
              className="justify-center mb-8"
            />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Soluções digitais para receitas reais
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Transformando a forma como médicos, farmacêuticos e pacientes
              gerenciam receitas médicas. Seguro, rápido e 100% digital.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-teal hover:bg-teal/90 text-white"
                onClick={() => navigate("/")}
              >
                Acessar Sistema
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() =>
                  document
                    .getElementById("servicos")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Conhecer Serviços
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Section */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Nossos Serviços
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Uma plataforma completa para gestão de receitas médicas digitais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Para Médicos */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-6">
                <Stethoscope className="w-8 h-8 text-teal" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Para Médicos</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Criação de receitas digitais</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Histórico de pacientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Renovação de receitas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Assinatura digital segura</span>
                </li>
              </ul>
            </div>

            {/* Para Farmacêuticos */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-6">
                <Pill className="w-8 h-8 text-teal" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">
                Para Farmacêuticos
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Validação por QR Code</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Verificação de autenticidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Registro de dispensação</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Histórico de vendas</span>
                </li>
              </ul>
            </div>

            {/* Para Pacientes */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-6">
                <Smartphone className="w-8 h-8 text-teal" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">
                Para Pacientes
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Acesso às receitas pelo celular</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Histórico de medicamentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>QR Code para farmácia</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
                  <span>Notificações de validade</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-20 grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-navy" />
              </div>
              <h4 className="font-semibold text-navy mb-2">100% Digital</h4>
              <p className="text-sm text-gray-600">Sem papel, sem filas</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-7 h-7 text-navy" />
              </div>
              <h4 className="font-semibold text-navy mb-2">QR Code</h4>
              <p className="text-sm text-gray-600">Validação instantânea</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-navy" />
              </div>
              <h4 className="font-semibold text-navy mb-2">Seguro</h4>
              <p className="text-sm text-gray-600">Dados criptografados</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-navy" />
              </div>
              <h4 className="font-semibold text-navy mb-2">Rápido</h4>
              <p className="text-sm text-gray-600">Processo agilizado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Nós */}
      <section id="sobre" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                  Sobre o MedLink
                </h2>
                <p className="text-gray-600 mb-4">
                  O MedLink nasceu da necessidade de modernizar o sistema de
                  receitas médicas no Brasil. Nossa missão é facilitar a vida de
                  profissionais de saúde e pacientes através da tecnologia.
                </p>
                <p className="text-gray-600 mb-6">
                  Desenvolvido com segurança, o
                  MedLink garante a integridade e autenticidade de cada receita
                  emitida, combatendo fraudes e facilitando o acesso a
                  medicamentos.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-teal mb-1">
                      +100
                    </div>
                    <div className="text-sm text-gray-600">
                      Médicos cadastrados
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-teal mb-1">
                      +40
                    </div>
                    <div className="text-sm text-gray-600">
                      Farmácias parceiras
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-teal mb-1">
                      +1000
                    </div>
                    <div className="text-sm text-gray-600">
                      Receitas emitidas
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-teal mb-1">
                      96%
                    </div>
                    <div className="text-sm text-gray-600">
                      Satisfação dos usuários
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-teal to-navy rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">Nossos Valores</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-teal-300 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Segurança</h4>
                        <p className="text-white/80 text-sm">
                          Proteção de dados em primeiro lugar
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-teal-300 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Inovação</h4>
                        <p className="text-white/80 text-sm">
                          Tecnologia de ponta para saúde
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-teal-300 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Acessibilidade</h4>
                        <p className="text-white/80 text-sm">
                          Saúde digital para todos
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-teal-300 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Confiança</h4>
                        <p className="text-white/80 text-sm">
                          Transparência em todas as ações
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Entre em Contato
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tem dúvidas ou quer saber mais? Fale conosco!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <a
                href="mailto:medlink@email.com"
                className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-teal" />
                </div>
                <h3 className="font-semibold text-navy mb-2">E-mail</h3>
                <p className="text-gray-600">medlink@email.com</p>
              </a>

              <a
                href="https://wa.me/5515998765432"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8 text-teal" />
                </div>
                <h3 className="font-semibold text-navy mb-2">WhatsApp</h3>
                <p className="text-gray-600">+55 15 99876-5432</p>
              </a>

              <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-teal" />
                </div>
                <h3 className="font-semibold text-navy mb-2">Localização</h3>
                <p className="text-gray-600">Itapeva, SP - Brasil</p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-16 text-center bg-navy rounded-2xl p-12">
              <h3 className="text-2xl font-bold text-white mb-4">
                Pronto para começar?
              </h3>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Junte-se a centenas de profissionais de saúde que já utilizam o
                MedLink
              </p>
              <Button
                size="lg"
                className="bg-teal hover:bg-teal/90 text-white"
                onClick={() => navigate("/")}
              >
                Acessar o Sistema
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
