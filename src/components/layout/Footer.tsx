import { MedLinkLogo } from "@/components/MedLinkLogo";
import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  servicos: [
    { label: "Visualização de Receitas", href: "#" },
    { label: "Expedição de Receitas", href: "#" },
    { label: "Visualização de Bulas", href: "#" },
  ],
  suporte: [
    { label: "Nos Contate", href: "#" },
    { label: "Documentação", href: "#" },
    { label: "Guias", href: "#" },
  ],
  empresa: [
    { label: "Sobre Nós", href: "#" },
    { label: "Redes Sociais", href: "#" },
    { label: "Trabalhe Conosco", href: "#" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-navy text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center lg:text-left">
          <div className="space-y-4 flex flex-col items-center lg:items-start">
            <MedLinkLogo variant="white" size="md" />
            <p className="text-sm text-white/70">
              Soluções digitais
              <br />
              para receitas reais
            </p>
            <div className="space-y-2 pt-4">
              <a
                href="mailto:medlink@email.com"
                className="flex items-center justify-center lg:justify-start gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                medlink@email.com
              </a>
              <a
                href="https://wa.me/5515998765432"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center lg:justify-start gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                +55 15 99876-5432
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-teal mb-4">
              Serviços
            </h3>
            <ul className="space-y-2">
              {footerLinks.servicos.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-teal mb-4">
              Suporte
            </h3>
            <ul className="space-y-2">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-teal mb-4">
              Empresa
            </h3>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-white/50">
            Feito por © MedLink 2026. Todos os Direitos Reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
