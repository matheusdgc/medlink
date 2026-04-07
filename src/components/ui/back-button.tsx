/**
 * BackButton — botao de voltar padronizado para todas as paginas de acao rapida.
 *
 * Design:
 *   - Fundo teal solido, icone de seta branco, cantos arredondados
 *   - No hover: leve escurecimento + elevacao sutil (translate-y)
 *   - A seta desliza levemente para a esquerda no hover (feedback de direcao)
 *
 * Uso:
 *   <BackButton />                    // navega para a pagina anterior no historico
 *   <BackButton to="/medico" />       // navega para rota especifica
 *   <BackButton to="/farmacia" />
 */

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  /** Rota de destino. Se omitido, usa navigate(-1) — volta para a pagina anterior. */
  to?: string;
  /** Texto acessivel para leitores de tela. Padrao: "Voltar" */
  label?: string;
}

export function BackButton({ to, label = "Voltar" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      className={[
        // Tamanho e forma
        "flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0",
        // Cor de fundo e icone
        "bg-teal text-white",
        // Transicoes suaves
        "transition-all duration-200",
        // Hover: escurecimento + elevacao leve
        "hover:bg-teal/85 hover:shadow-md hover:-translate-y-0.5",
        // Focus: anel de foco acessivel
        "focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2",
        // Grupo para animar o icone filho
        "group",
      ].join(" ")}
    >
      {/*
        A seta desliza 2px para a esquerda no hover, reforçando visualmente
        que o botao navega "de volta" para a pagina anterior.
      */}
      <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
    </button>
  );
}
