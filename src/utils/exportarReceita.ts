/**
 * Gerador de PDF para receitas medicas individuais.
 *
 * Dependencias carregadas via CDN (index.html):
 *   - jsPDF 2.5.1    → (window as any).jspdf.jsPDF
 *   - qrcode-generator → (window as any).qrcode(typeNumber, ecLevel)
 *
 * Design do documento (A4 portrait):
 *   ┌──────────────────────────────────────────┐ ← fundo navy
 *   │  MedLink                      [QR Code]  │
 *   │  Sistema de Receitas Digitais            │
 *   │  RECEITA MEDICA DIGITAL                  │
 *   ├══════════════════════════════════════════╡ ← barra teal
 *   │  Emitida em: xx/xx/xxxx | Valida ate:...│ ← fundo cinza suave
 *   ├──────────────────────────────────────────│
 *   │▌ PACIENTE                                │ ← barra lateral teal
 *   │  Nome do paciente                        │
 *   │▌ MEDICO PRESCRITOR                       │
 *   │  Dr(a). Nome  CRM XXXX/UF               │
 *   │▌ MEDICAMENTOS PRESCRITOS                 │
 *   │  ┌─────────────────────────────────────┐ │ ← card com fundo suave
 *   │  │① Medicamento 500mg — Comprimido     │ │
 *   │  │  Posologia: 1 comp. a cada 8 horas  │ │
 *   │  │  Quantidade: 20 unidade(s)          │ │
 *   │  └─────────────────────────────────────┘ │
 *   │  ┌────────────────────┐ ┌──────────────┐ │ ← assinatura + carimbo
 *   │  │ Assinatura Medico  │ │   Carimbo    │ │
 *   │  └────────────────────┘ └──────────────┘ │
 *   │  ┌──────────────────────────────────────┐ │ ← box codigo
 *   │  │ CODIGO: XXXXXXXXXXXXXXXX             │ │
 *   │  └──────────────────────────────────────┘ │
 *   ├──────────────────────────────────────────╡ ← rodape navy
 *   │  MedLink — Gerado em XX/XX — Pagina 1/1  │
 *   └──────────────────────────────────────────┘
 */

// Tipo minimo necessario para gerar o PDF.
// Compativel com o tipo Receita de ReceitasPaciente.tsx e ValidarReceita.tsx.
export interface ReceitaParaPdf {
  codigo: string;
  criadaEm: string;
  validadeAte: string;
  diagnostico?: string | null;
  observacoes?: string | null;
  medico: {
    crm: string;
    ufCrm: string;
    especialidade?: string | null;
    nomeClinica?: string | null;
    usuario: { nome: string };
  };
  itens: {
    medicamento: string;
    principioAtivo?: string | null;
    dosagem: string;
    formaFarmaceutica?: string | null;
    quantidade: number;
    posologia: string;
    observacao?: string | null;
  }[];
}

// ============================================================
// HELPER: gera QR Code como data URL PNG
// ============================================================

function gerarQrDataUrl(texto: string): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qr = (window as any).qrcode(0, "M");
    qr.addData(texto);
    qr.make();
    return qr.createDataURL(4, 1);
  } catch (e) {
    console.warn("[exportarReceita] QR Code generator indisponivel:", e);
    return null;
  }
}

// ============================================================
// FUNCAO PRINCIPAL
// ============================================================

export function exportarReceitaPdf(
  receita: ReceitaParaPdf,
  pacienteNome: string
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { jsPDF } = (window as any).jspdf ?? {};
  if (!jsPDF) {
    alert(
      "Biblioteca PDF não carregada. Verifique sua conexão e recarregue a página."
    );
    return;
  }

  // A4 = 595.28 x 841.89 pt
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 40; // margem lateral

  // Paleta de cores
  const TEAL: [number, number, number] = [15, 118, 110];
  const TEAL_LIGHT: [number, number, number] = [203, 229, 228];
  const NAVY: [number, number, number] = [30, 58, 95];
  const GRAY: [number, number, number] = [100, 100, 100];
  const WHITE: [number, number, number] = [255, 255, 255];
  const CARD_BG: [number, number, number] = [246, 250, 251];
  const HEADER_SUBTITLE: [number, number, number] = [178, 210, 230];

  let Y = 0;

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR");

  // Garante espaco antes de desenhar; abre nova pagina se necessario
  const garantirEspaco = (altura: number) => {
    if (Y + altura > PAGE_H - 60) {
      doc.addPage();
      Y = M;
    }
  };

  // ====== CABECALHO COM FUNDO NAVY ======
  // Bloco de fundo cobrindo toda a largura da pagina
  const HEADER_H = 95;
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, HEADER_H, "F");

  // "MedLink" em branco, grande
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text("MedLink", M, 38);

  // Linha separadora discreta entre nome e subtitulo
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.line(M, 44, M + 148, 44);

  // Subtitulo em azul claro
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...HEADER_SUBTITLE);
  doc.text("Sistema de Receitas Medicas Digitais", M, 56);

  // "RECEITA MEDICA DIGITAL" em destaque suave
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...HEADER_SUBTITLE);
  doc.text("RECEITA MEDICA DIGITAL", M, 76);

  // QR Code no lado direito do cabecalho
  const QR = 70;
  const qrDataUrl = gerarQrDataUrl(receita.codigo);
  if (qrDataUrl) {
    const qrX = PAGE_W - M - QR;
    const qrY = 8;
    // Fundo branco em volta do QR para contraste sobre o navy
    doc.setFillColor(...WHITE);
    doc.rect(qrX - 4, qrY - 2, QR + 8, QR + 12, "F");
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, QR, QR);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text("Escanear para validar", qrX + QR / 2 + 4, qrY + QR + 8, {
      align: "center",
    });
  }

  // Barra teal de 4pt separando o cabecalho do corpo
  Y = HEADER_H;
  doc.setFillColor(...TEAL);
  doc.rect(0, Y, PAGE_W, 4, "F");
  Y += 4;

  // ====== FAIXA DE DATAS ======
  // Fundo cinza-azulado muito suave, mais formal que texto solto
  doc.setFillColor(245, 248, 250);
  doc.rect(0, Y, PAGE_W, 28, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text(
    `Emitida em: ${formatarData(receita.criadaEm)}     |     Valida ate: ${formatarData(receita.validadeAte)}`,
    M,
    Y + 18
  );
  Y += 28 + 18;

  // ====== HELPER: TITULO DE SECAO COM BARRA LATERAL ======
  // Usa uma barra vertical teal de 3pt no lugar da linha horizontal tradicional.
  // Cria hierarquia visual sem poluir com linhas por toda a pagina.
  const tituloSecao = (texto: string) => {
    garantirEspaco(26);
    doc.setFillColor(...TEAL);
    doc.rect(M, Y - 12, 3, 17, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEAL);
    doc.text(texto.toUpperCase(), M + 10, Y);
    Y += 15;
  };

  // ====== PACIENTE ======
  tituloSecao("Paciente");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(pacienteNome, M + 10, Y);
  Y += 22;

  // ====== MEDICO PRESCRITOR ======
  tituloSecao("Médico Prescritor");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(receita.medico.usuario.nome, M + 10, Y);
  Y += 13;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  const crmLine = `CRM ${receita.medico.crm}/${receita.medico.ufCrm}${
    receita.medico.especialidade ? ` — ${receita.medico.especialidade}` : ""
  }`;
  doc.text(crmLine, M + 10, Y);
  Y += 11;

  if (receita.medico.nomeClinica) {
    doc.text(receita.medico.nomeClinica, M + 10, Y);
    Y += 11;
  }
  Y += 10;

  // ====== DIAGNOSTICO (opcional) ======
  if (receita.diagnostico) {
    tituloSecao("Diagnóstico / Indicação");
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    const linhasDiag = doc.splitTextToSize(
      receita.diagnostico,
      PAGE_W - 2 * M - 10
    );
    doc.text(linhasDiag, M + 10, Y);
    Y += linhasDiag.length * 13 + 14;
  }

  // ====== MEDICAMENTOS EM CARDS ======
  tituloSecao("Medicamentos Prescritos");

  const CARD_W = PAGE_W - 2 * M;
  const TEXT_W = CARD_W - 32; // largura disponivel para texto dentro do card

  receita.itens.forEach((item, idx) => {
    // Pre-calcula todas as linhas de texto para saber a altura do card
    // antes de desenha-lo — necessario porque jsPDF nao tem layout automatico
    const nomeMed = item.formaFarmaceutica
      ? `${item.medicamento} ${item.dosagem} — ${item.formaFarmaceutica}`
      : `${item.medicamento} ${item.dosagem}`;

    const linhasNome = doc.splitTextToSize(nomeMed, TEXT_W);
    const linhasPoso = doc.splitTextToSize(
      `Posologia: ${item.posologia}`,
      TEXT_W
    );
    const linhasObs = item.observacao
      ? doc.splitTextToSize(`Obs: ${item.observacao}`, TEXT_W)
      : [];

    // Calcula altura total do card
    let cardH = 14; // padding top
    cardH += linhasNome.length * 13; // nome multiline
    cardH += 5; // espaco entre nome e posologia
    cardH += linhasPoso.length * 11; // posologia
    cardH += 11; // quantidade
    if (item.principioAtivo) cardH += 11;
    if (linhasObs.length > 0) cardH += linhasObs.length * 10 + 4;
    cardH += 12; // padding bottom

    garantirEspaco(cardH + 10);

    const cardY = Y;

    // Fundo do card: cinza-azulado bem suave
    doc.setFillColor(...CARD_BG);
    doc.setDrawColor(...TEAL_LIGHT);
    doc.setLineWidth(0.5);
    doc.rect(M, cardY, CARD_W, cardH, "FD");

    // Barra lateral teal (acento esquerdo de 4pt)
    doc.setFillColor(...TEAL);
    doc.rect(M, cardY, 4, cardH, "F");

    // Circulo numerado sobre a barra lateral
    // Centralizado horizontalmente na barra (x = M + 2) e na parte superior do card
    const circleX = M + 2;
    const circleY = cardY + 18;
    doc.setFillColor(...NAVY);
    doc.ellipse(circleX, circleY, 8, 8, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(String(idx + 1), circleX, circleY + 3, { align: "center" });

    // Posicao de inicio do texto dentro do card
    let cy = cardY + 16;
    const cx = M + 18; // recua do acento lateral

    // Nome do medicamento
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(linhasNome, cx, cy);
    cy += linhasNome.length * 13 + 5;

    // Posologia
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(linhasPoso, cx, cy);
    cy += linhasPoso.length * 11;

    // Quantidade
    doc.text(`Quantidade: ${item.quantidade} unidade(s)`, cx, cy);
    cy += 11;

    // Principio ativo
    if (item.principioAtivo) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Princípio ativo: ${item.principioAtivo}`, cx, cy);
      cy += 11;
    }

    // Observacao do item
    if (linhasObs.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(linhasObs, cx, cy);
    }

    Y = cardY + cardH + 10;
  });

  // ====== OBSERVACOES DO MEDICO (opcional) ======
  if (receita.observacoes) {
    garantirEspaco(50);
    tituloSecao("Observações do Médico");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    const linhasObs = doc.splitTextToSize(
      receita.observacoes,
      PAGE_W - 2 * M - 10
    );
    doc.text(linhasObs, M + 10, Y);
    Y += linhasObs.length * 12 + 12;
  }

  // ====== AREA DE ASSINATURA E CARIMBO ======
  // Separa a secao de conteudo clinico da area legal do documento
  garantirEspaco(90);
  Y += 6;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(M, Y, PAGE_W - M, Y);
  Y += 16;

  const SIG_TOTAL_W = PAGE_W - 2 * M;
  const STAMP_W = 90;
  const SIG_W = SIG_TOTAL_W - STAMP_W - 10;
  const SIG_H = 54;

  // Caixa de assinatura (maior, a esquerda)
  doc.setDrawColor(190, 190, 190);
  doc.setLineWidth(0.4);
  doc.rect(M, Y, SIG_W, SIG_H, "S");

  // Caixa de carimbo (menor, a direita)
  doc.rect(M + SIG_W + 10, Y, STAMP_W, SIG_H, "S");

  // Labels abaixo das caixas
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Assinatura e identificação do Médico Prescritor", M + SIG_W / 2, Y + SIG_H - 7, {
    align: "center",
  });
  doc.text("Carimbo", M + SIG_W + 10 + STAMP_W / 2, Y + SIG_H - 7, {
    align: "center",
  });

  Y += SIG_H + 18;

  // ====== BOX DO CODIGO DE VERIFICACAO ======
  garantirEspaco(58);

  const CODE_BOX_H = 50;
  doc.setFillColor(245, 248, 250);
  doc.setDrawColor(...TEAL_LIGHT);
  doc.setLineWidth(0.5);
  doc.rect(M, Y, PAGE_W - 2 * M, CODE_BOX_H, "FD");

  // Acento teal a esquerda do box
  doc.setFillColor(...TEAL);
  doc.rect(M, Y, 3, CODE_BOX_H, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEAL);
  doc.text("CÓDIGO DE VERIFICAÇÃO", M + 12, Y + 15);

  doc.setFontSize(9.5);
  doc.setFont("courier", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(receita.codigo, M + 12, Y + 30);

  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...GRAY);
  doc.text(
    "Apresente na farmácia ou peça para escanear o QR Code no cabeçalho.",
    M + 12,
    Y + 43
  );

  // ====== RODAPE DE PAGINA (navy, em todas as paginas) ======
  const totalPgs = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPgs; p++) {
    doc.setPage(p);
    doc.setFillColor(...NAVY);
    doc.rect(0, PAGE_H - 22, PAGE_W, 22, "F");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...HEADER_SUBTITLE);
    doc.text(
      `MedLink — Documento gerado em ${new Date().toLocaleString("pt-BR")} — Página ${p} de ${totalPgs}`,
      PAGE_W / 2,
      PAGE_H - 8,
      { align: "center" }
    );
  }

  doc.save(`receita-medlink-${receita.codigo.slice(0, 10)}.pdf`);
}
