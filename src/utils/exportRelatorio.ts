/**
 * Utilitarios de exportacao para a pagina de Relatorios.
 *
 * As bibliotecas (jsPDF, jspdf-autotable, SheetJS) sao carregadas via CDN
 * no index.html, portanto sao acessadas como globais em window.
 * Isso elimina a necessidade de "npm install" para essas dependencias.
 *
 * Padroes utilizados:
 * - (window as any): informa ao TypeScript que o objeto existe em runtime,
 *   mesmo que nao haja declaracao de tipo (@types) instalada.
 * - jsPDF "autoTable": plugin que adiciona o metodo .autoTable() na instancia
 *   jsPDF, permitindo tabelas formatadas sem CSS/HTML.
 * - SheetJS utils.aoa_to_sheet: converte um "array of arrays" em sheet do Excel.
 *   "aoa" = Array Of Arrays. Cada sub-array e uma linha, cada elemento e uma celula.
 */

import type { VisaoGeral, MedicamentoRanking, DiagnosticoRanking, StatusRanking } from "@/services/api";

// ============================================================
// TIPOS AUXILIARES
// ============================================================

export interface DadosRelatorio {
  visaoGeral: VisaoGeral | null;
  medicamentos: MedicamentoRanking[];
  diagnosticos: DiagnosticoRanking[];
  statusDistribuicao: StatusRanking[];
  filtroMes?: string;    // ex: "Abril"
  filtroAno?: string;    // ex: "2026"
}

// Mapa de labels para os status
const LABEL_STATUS: Record<string, string> = {
  ATIVA: "Ativas",
  DISPENSADA: "Dispensadas",
  VENCIDA: "Vencidas",
  CANCELADA: "Canceladas",
};

// Data e hora formatadas em pt-BR para o cabecalho dos relatorios
const dataHoraAtual = () =>
  new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ============================================================
// EXPORTAR PARA PDF
// ============================================================

/**
 * Gera um arquivo PDF com os dados do relatorio e dispara o download.
 *
 * Estrutura do PDF:
 * 1. Cabecalho com logo textual e data de geracao
 * 2. Secao: Visao Geral do sistema (totais)
 * 3. Secao: Distribuicao por status (tabela)
 * 4. Secao: Top Medicamentos (tabela ranqueada)
 * 5. Secao: Diagnosticos (tabela com receitas e pacientes unicos)
 */
export function exportarPdf(dados: DadosRelatorio): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { jsPDF } = (window as any).jspdf;
  if (!jsPDF) {
    alert("Biblioteca PDF não carregada. Verifique sua conexão e recarregue a página.");
    return;
  }

  // Cria o documento em formato A4 portrait
  // "pt" = pontos (unidade padrao do jsPDF), [595.28, 841.89] = A4 em pontos
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const LARGURA = doc.internal.pageSize.getWidth();
  const MARGEM = 40;
  const COR_TEAL = [15, 118, 110];    // #0F766E
  const COR_NAVY = [30, 58, 95];      // #1E3A5F
  const COR_CINZA = [100, 100, 100];
  let cursorY = MARGEM;

  // ------ Helper: adiciona nova pagina se necessario ------
  const checarPagina = (alturaNecessaria: number) => {
    if (cursorY + alturaNecessaria > 800) {
      doc.addPage();
      cursorY = MARGEM;
    }
  };

  // ------ Helper: titulo de secao colorido ------
  const tituloSecao = (texto: string) => {
    checarPagina(30);
    doc.setFontSize(12);
    doc.setTextColor(...COR_TEAL as [number, number, number]);
    doc.setFont("helvetica", "bold");
    doc.text(texto.toUpperCase(), MARGEM, cursorY);
    doc.setDrawColor(...COR_TEAL as [number, number, number]);
    doc.line(MARGEM, cursorY + 4, LARGURA - MARGEM, cursorY + 4);
    cursorY += 20;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
  };

  // ====== CABECALHO ======
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COR_NAVY as [number, number, number]);
  doc.text("MedLink", MARGEM, cursorY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA as [number, number, number]);
  doc.text("Sistema de Receitas Médicas Digitais", MARGEM, cursorY + 16);

  // Data de geracao alinhada a direita
  doc.text(`Gerado em: ${dataHoraAtual()}`, LARGURA - MARGEM, cursorY + 8, { align: "right" });

  cursorY += 45;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  const tituloRel = dados.filtroMes && dados.filtroAno
    ? `Relatório de ${dados.filtroMes} de ${dados.filtroAno}`
    : "Relatório Geral do Sistema";
  doc.text(tituloRel, MARGEM, cursorY);
  cursorY += 30;

  // ====== VISAO GERAL ======
  if (dados.visaoGeral) {
    tituloSecao("Visão Geral");
    const vg = dados.visaoGeral;
    // autoTable recebe "body" como array de arrays e "head" como headers
    (doc as any).autoTable({
      startY: cursorY,
      head: [["Indicador", "Valor"]],
      body: [
        ["Total de Receitas", vg.totalReceitas],
        ["Total de Pacientes", vg.totalPacientes],
        ["Médicos Cadastrados", vg.totalMedicos],
        ["Total de Dispensações", vg.totalDispensacoes],
        ["Receitas Ativas", vg.receitasAtivas],
        ["Receitas Dispensadas", vg.receitasDispensadas],
        ["Receitas Vencidas", vg.receitasVencidas],
        ["Receitas Canceladas", vg.receitasCanceladas],
      ],
      headStyles: { fillColor: COR_NAVY, textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      margin: { left: MARGEM, right: MARGEM },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 20;
  }

  // ====== STATUS ======
  if (dados.statusDistribuicao.length > 0) {
    checarPagina(80);
    tituloSecao("Distribuição por Status");
    (doc as any).autoTable({
      startY: cursorY,
      head: [["Status", "Quantidade"]],
      body: dados.statusDistribuicao.map((s) => [
        LABEL_STATUS[s.status] ?? s.status,
        s.total,
      ]),
      headStyles: { fillColor: COR_TEAL, textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      margin: { left: MARGEM, right: MARGEM },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 20;
  }

  // ====== MEDICAMENTOS ======
  if (dados.medicamentos.length > 0) {
    checarPagina(80);
    tituloSecao("Medicamentos Mais Receitados");
    (doc as any).autoTable({
      startY: cursorY,
      head: [["#", "Medicamento", "Vezes Prescrito"]],
      body: dados.medicamentos.map((m, i) => [i + 1, m.medicamento, m.total]),
      headStyles: { fillColor: COR_NAVY, textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { halign: "center", cellWidth: 30 },
        2: { halign: "right", fontStyle: "bold" },
      },
      margin: { left: MARGEM, right: MARGEM },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 20;
  }

  // ====== DIAGNOSTICOS ======
  if (dados.diagnosticos.length > 0) {
    checarPagina(80);
    tituloSecao("Diagnósticos Mais Frequentes");
    (doc as any).autoTable({
      startY: cursorY,
      head: [["#", "Diagnóstico", "Receitas", "Pacientes Únicos"]],
      body: dados.diagnosticos.map((d, i) => [
        i + 1,
        d.diagnostico,
        d.totalReceitas,
        d.pacientesUnicos,
      ]),
      headStyles: { fillColor: COR_TEAL, textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { halign: "center", cellWidth: 30 },
        2: { halign: "right", fontStyle: "bold" },
        3: { halign: "right", fontStyle: "bold" },
      },
      margin: { left: MARGEM, right: MARGEM },
    });
  }

  // ====== RODAPE EM TODAS AS PAGINAS ======
  const totalPaginas = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COR_CINZA as [number, number, number]);
    doc.text(
      `MedLink — Relatório gerado em ${dataHoraAtual()} — Página ${i} de ${totalPaginas}`,
      LARGURA / 2,
      830,
      { align: "center" }
    );
  }

  // Dispara o download
  const nomeArquivo = dados.filtroMes && dados.filtroAno
    ? `relatorio-medlink-${dados.filtroMes}-${dados.filtroAno}.pdf`
    : `relatorio-medlink-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(nomeArquivo);
}

// ============================================================
// EXPORTAR PARA EXCEL (.xlsx)
// ============================================================

/**
 * Gera um arquivo .xlsx com abas separadas por categoria.
 *
 * Estrutura do arquivo:
 * - Aba "Visao Geral": indicadores gerais do sistema
 * - Aba "Medicamentos": ranking de medicamentos prescritos
 * - Aba "Status": distribuicao por status de receita
 * - Aba "Diagnosticos": diagnosticos com receitas e pacientes unicos
 *
 * SheetJS XLSX funciona com "workbooks" (pastas de trabalho):
 * - utils.book_new()           -> cria um workbook vazio
 * - utils.aoa_to_sheet(data)   -> converte array de arrays em uma "sheet"
 * - utils.book_append_sheet()  -> adiciona a sheet ao workbook com um nome de aba
 * - writeFileXLSX()            -> serializa e dispara o download do .xlsx
 */
export function exportarExcel(dados: DadosRelatorio): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX = (window as any).XLSX;
  if (!XLSX) {
    alert("Biblioteca Excel não carregada. Verifique sua conexão e recarregue a página.");
    return;
  }

  const wb = XLSX.utils.book_new();

  // ------ ABA: Visao Geral ------
  if (dados.visaoGeral) {
    const vg = dados.visaoGeral;
    const abaVG = XLSX.utils.aoa_to_sheet([
      ["MedLink — Relatório Geral"],
      [`Gerado em: ${dataHoraAtual()}`],
      [],
      ["VISÃO GERAL DO SISTEMA"],
      ["Indicador", "Valor"],
      ["Total de Receitas", vg.totalReceitas],
      ["Total de Pacientes", vg.totalPacientes],
      ["Médicos Cadastrados", vg.totalMedicos],
      ["Total de Dispensações", vg.totalDispensacoes],
      [],
      ["STATUS DAS RECEITAS"],
      ["Status", "Quantidade"],
      ...dados.statusDistribuicao.map((s) => [
        LABEL_STATUS[s.status] ?? s.status,
        s.total,
      ]),
    ]);
    // Define largura das colunas (em caracteres)
    abaVG["!cols"] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, abaVG, "Visão Geral");
  }

  // ------ ABA: Medicamentos ------
  if (dados.medicamentos.length > 0) {
    const abaMeds = XLSX.utils.aoa_to_sheet([
      ["MEDICAMENTOS MAIS RECEITADOS"],
      [`Gerado em: ${dataHoraAtual()}`],
      [],
      ["#", "Medicamento", "Vezes Prescrito"],
      ...dados.medicamentos.map((m, i) => [i + 1, m.medicamento, m.total]),
    ]);
    abaMeds["!cols"] = [{ wch: 6 }, { wch: 40 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, abaMeds, "Medicamentos");
  }

  // ------ ABA: Diagnosticos ------
  if (dados.diagnosticos.length > 0) {
    const tituloDiag = dados.filtroMes && dados.filtroAno
      ? `DIAGNÓSTICOS — ${dados.filtroMes.toUpperCase()} DE ${dados.filtroAno}`
      : "DIAGNÓSTICOS MAIS FREQUENTES";
    const abaDiag = XLSX.utils.aoa_to_sheet([
      [tituloDiag],
      [`Gerado em: ${dataHoraAtual()}`],
      [],
      ["#", "Diagnóstico", "Total de Receitas", "Pacientes Únicos"],
      ...dados.diagnosticos.map((d, i) => [
        i + 1,
        d.diagnostico,
        d.totalReceitas,
        d.pacientesUnicos,
      ]),
    ]);
    abaDiag["!cols"] = [{ wch: 6 }, { wch: 35 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, abaDiag, "Diagnósticos");
  }

  // Dispara o download do .xlsx
  const nomeArquivo = dados.filtroMes && dados.filtroAno
    ? `relatorio-medlink-${dados.filtroMes}-${dados.filtroAno}.xlsx`
    : `relatorio-medlink-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
}
