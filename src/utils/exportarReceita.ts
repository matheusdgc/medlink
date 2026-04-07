/**
 * Gerador de PDF para receitas medicas individuais.
 *
 * Dependencias carregadas via CDN (index.html):
 *   - jsPDF 2.5.1    → (window as any).jspdf.jsPDF
 *   - qrcode-generator → (window as any).qrcode(typeNumber, ecLevel)
 *
 * Design do documento (A4 portrait):
 *   ┌──────────────────────────────────────────┐
 *   │  MedLink                      [QR Code]  │
 *   │  Sistema de Receitas Digitais             │
 *   │─────────────────────────────────────────│
 *   │  RECEITA MEDICA DIGITAL                  │
 *   │  Emitida em: xx/xx/xxxx | Valida ate:... │
 *   │─────────────────────────────────────────│
 *   │  PACIENTE                                │
 *   │  Nome do paciente                        │
 *   │─────────────────────────────────────────│
 *   │  MEDICO PRESCRITOR                       │
 *   │  Dr(a). Nome  CRM XXXX/UF               │
 *   │─────────────────────────────────────────│
 *   │  MEDICAMENTOS                            │
 *   │  ① Medicamento 500mg - Comprimido        │
 *   │    Posologia: 1 comp. a cada 8 horas     │
 *   │    Quantidade: 20 unidade(s)             │
 *   │─────────────────────────────────────────│
 *   │  Codigo: XXXXXXXXXXXXXXXX                │
 *   │  Apresente na farmacia para dispensacao  │
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

/**
 * Usa a biblioteca qrcode-generator para criar uma imagem PNG (data URL)
 * que encode o texto informado.
 *
 * typeNumber=0 → o tamanho da matriz e calculado automaticamente com base
 *   no comprimento do texto. Codigos de receita sao curtos, entao typeNumber=0
 *   resulta em uma versao pequena e legivel.
 * errorCorrectionLevel='M' → correcao media (15% de redundancia).
 *   Equilibrio entre tamanho do QR e robustez a danos fisicos.
 * createDataURL(cellSize, margin) → cellSize=4px por modulo e margem 1 modulo.
 */
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
      "Biblioteca PDF nao carregada. Verifique sua conexao e recarregue a pagina."
    );
    return;
  }

  // Cria o documento A4 em pontos (pt).
  // A4 = 595.28 x 841.89 pt
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 40; // margem lateral

  // Paleta de cores (RGB)
  const TEAL: [number, number, number] = [15, 118, 110];
  const NAVY: [number, number, number] = [30, 58, 95];
  const GRAY: [number, number, number] = [100, 100, 100];
  const LGRAY: [number, number, number] = [220, 220, 220];

  let Y = M; // cursor vertical

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR");

  // Garante que ha espaco suficiente; se nao, abre nova pagina
  const garantirEspaco = (altura: number) => {
    if (Y + altura > PAGE_H - 40) {
      doc.addPage();
      Y = M;
    }
  };

  // Linha divisora horizontal fina
  const linhaDivisora = (cor: [number, number, number] = LGRAY) => {
    doc.setDrawColor(...cor);
    doc.setLineWidth(0.4);
    doc.line(M, Y, PAGE_W - M, Y);
    Y += 10;
  };

  // Titulo de secao em teal maiusculo
  const tituloSecao = (texto: string) => {
    garantirEspaco(20);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEAL);
    doc.text(texto.toUpperCase(), M, Y);
    Y += 4;
    linhaDivisora(TEAL);
  };

  // ====== CABECALHO ======
  // Nome MedLink (grande, navy)
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("MedLink", M, Y);

  // Subtitulo
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("Sistema de Receitas Medicas Digitais", M, Y + 13);

  // QR Code no canto superior direito
  const QR = 72;
  const qrDataUrl = gerarQrDataUrl(receita.codigo);
  if (qrDataUrl) {
    const qrX = PAGE_W - M - QR;
    doc.addImage(qrDataUrl, "PNG", qrX, Y - 12, QR, QR);
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY);
    doc.text("Escanear para validar", qrX + QR / 2, Y + QR - 8, {
      align: "center",
    });
  }

  Y += 32;

  // Linha teal grossa separando cabecalho do corpo
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(1.5);
  doc.line(M, Y, PAGE_W - M, Y);
  Y += 14;

  // Titulo do documento
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("RECEITA MEDICA DIGITAL", M, Y);
  Y += 12;

  // Datas em linha
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text(
    `Emitida em: ${formatarData(receita.criadaEm)}     Valida ate: ${formatarData(receita.validadeAte)}`,
    M,
    Y
  );
  Y += 22;

  // ====== PACIENTE ======
  tituloSecao("Paciente");

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(pacienteNome, M, Y);
  Y += 18;

  // ====== MEDICO PRESCRITOR ======
  tituloSecao("Medico Prescritor");

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(receita.medico.usuario.nome, M, Y);
  Y += 13;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  const crmLine = `CRM ${receita.medico.crm}/${receita.medico.ufCrm}${receita.medico.especialidade ? ` — ${receita.medico.especialidade}` : ""}`;
  doc.text(crmLine, M, Y);
  Y += 10;

  if (receita.medico.nomeClinica) {
    doc.setFontSize(8.5);
    doc.text(receita.medico.nomeClinica, M, Y);
    Y += 10;
  }
  Y += 8;

  // ====== DIAGNOSTICO (opcional) ======
  if (receita.diagnostico) {
    tituloSecao("Diagnostico / Indicacao");
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const linhasDiag = doc.splitTextToSize(
      receita.diagnostico,
      PAGE_W - 2 * M
    );
    doc.text(linhasDiag, M, Y);
    Y += linhasDiag.length * 12 + 12;
  }

  // ====== MEDICAMENTOS ======
  tituloSecao("Medicamentos Prescritos");

  receita.itens.forEach((item, idx) => {
    garantirEspaco(55);

    // Circulo com numero do item
    // fillEllipse(x, y, rx, ry) — centralizado em (M+8, Y-3)
    doc.setFillColor(...TEAL);
    doc.ellipse(M + 8, Y - 3, 7, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(String(idx + 1), M + 8, Y, { align: "center" });

    // Nome e forma farmaceutica
    const nomeMed =
      item.formaFarmaceutica
        ? `${item.medicamento} ${item.dosagem} — ${item.formaFarmaceutica}`
        : `${item.medicamento} ${item.dosagem}`;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const linhasNome = doc.splitTextToSize(nomeMed, PAGE_W - 2 * M - 22);
    doc.text(linhasNome, M + 20, Y);
    Y += linhasNome.length * 12 + 2;

    // Posologia
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    const linhasPoso = doc.splitTextToSize(
      `Posologia: ${item.posologia}`,
      PAGE_W - 2 * M - 22
    );
    doc.text(linhasPoso, M + 20, Y);
    Y += linhasPoso.length * 11;

    // Quantidade
    doc.text(`Quantidade: ${item.quantidade} unidade(s)`, M + 20, Y);
    Y += 11;

    // Principio ativo
    if (item.principioAtivo) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Principio ativo: ${item.principioAtivo}`, M + 20, Y);
      Y += 10;
    }

    // Observacao do item
    if (item.observacao) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const linhasObs = doc.splitTextToSize(
        `Obs: ${item.observacao}`,
        PAGE_W - 2 * M - 22
      );
      doc.text(linhasObs, M + 20, Y);
      Y += linhasObs.length * 10;
    }

    Y += 10; // espaco entre itens
  });

  // ====== OBSERVACOES DO MEDICO (opcional) ======
  if (receita.observacoes) {
    garantirEspaco(40);
    tituloSecao("Observacoes do Medico");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const linhasObs = doc.splitTextToSize(
      receita.observacoes,
      PAGE_W - 2 * M
    );
    doc.text(linhasObs, M, Y);
    Y += linhasObs.length * 12 + 8;
  }

  // ====== RODAPE: CODIGO DE VERIFICACAO ======
  garantirEspaco(70);
  Y += 6;

  doc.setDrawColor(...TEAL);
  doc.setLineWidth(1);
  doc.line(M, Y, PAGE_W - M, Y);
  Y += 14;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("Codigo de verificacao:", M, Y);
  Y += 11;

  doc.setFontSize(9);
  doc.setFont("courier", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(receita.codigo, M, Y);
  Y += 13;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...GRAY);
  doc.text(
    "Apresente este codigo na farmacia ou peca para escanear o QR Code.",
    M,
    Y
  );

  // Linha de rodape de pagina em todas as paginas
  const totalPgs = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPgs; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(
      `MedLink — Documento gerado em ${new Date().toLocaleString("pt-BR")} — Pagina ${p} de ${totalPgs}`,
      PAGE_W / 2,
      PAGE_H - 18,
      { align: "center" }
    );
  }

  doc.save(`receita-medlink-${receita.codigo.slice(0, 10)}.pdf`);
}
