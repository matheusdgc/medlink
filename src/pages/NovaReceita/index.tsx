import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";

import { BackButton } from "@/components/ui/back-button";
import { useNovaReceita } from "./useNovaReceita";
import { BuscaPaciente } from "./BuscaPaciente";
import { ModalCriarPaciente } from "./ModalCriarPaciente";
import { AnamneseSection } from "./AnamneseSection";
import { MedicamentosSection } from "./MedicamentosSection";
import { InformacoesAdicionais } from "./InformacoesAdicionais";
import { ConferenciaReceita } from "./ConferenciaReceita";
import { ReceitaCriadaSucesso } from "./ReceitaCriadaSucesso";

export default function NovaReceita() {
  const navigate = useNavigate();
  const {
    cpfBusca,
    setCpfBusca,
    buscando,
    paciente,
    buscarPaciente,
    limparPaciente,

    modalCriarPaciente,
    setModalCriarPaciente,
    criandoPaciente,
    novoPaciente,
    setNovoPaciente,
    abrirModalCriarPaciente,
    criarNovoPaciente,

    validadeDias,
    setValidadeDias,
    diagnostico,
    setDiagnostico,
    observacoes,
    setObservacoes,

    itens,
    adicionarItem,
    removerItem,
    atualizarItem,

    possuiAlergia,
    setPossuiAlergia,
    alergias,
    setAlergias,
    possuiAgravante,
    setPossuiAgravante,
    agravantes,
    toggleAgravante,
    outraDoenca,
    setOutraDoenca,

    enviando,
    receitaCriada,
    criarReceita,

    etapa,
    irParaConferencia,
    voltarParaFormulario,
    resetarFormulario,
  } = useNovaReceita();

  if (receitaCriada) {
    return (
      <ReceitaCriadaSucesso
        codigoReceita={receitaCriada}
        onNovareceita={resetarFormulario}
      />
    );
  }

  if (etapa === "conferencia" && paciente) {
    return (
      <ConferenciaReceita
        paciente={paciente}
        possuiAlergia={possuiAlergia}
        alergias={alergias}
        possuiAgravante={possuiAgravante}
        agravantes={agravantes}
        outraDoenca={outraDoenca}
        itens={itens}
        validadeDias={validadeDias}
        diagnostico={diagnostico}
        observacoes={observacoes}
        enviando={enviando}
        onVoltar={voltarParaFormulario}
        onConfirmar={criarReceita}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showNav={true} showProfile={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <BackButton to="/medico" label="Voltar ao painel do médico" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nova Receita</h1>
              <p className="text-muted-foreground">
                Prescreva medicamentos para seu paciente
              </p>
            </div>
          </div>

          {/* Buscar Paciente */}
          <BuscaPaciente
            cpfBusca={cpfBusca}
            onCpfChange={setCpfBusca}
            buscando={buscando}
            paciente={paciente}
            onBuscar={buscarPaciente}
            onLimpar={limparPaciente}
            onAbrirModalCriar={abrirModalCriarPaciente}
          />

          {/* Anamnese do Paciente */}
          {paciente && (
            <AnamneseSection
              possuiAlergia={possuiAlergia}
              onPossuiAlergiaChange={setPossuiAlergia}
              alergias={alergias}
              onAlergiasChange={setAlergias}
              possuiAgravante={possuiAgravante}
              onPossuiAgravanteChange={setPossuiAgravante}
              agravantes={agravantes}
              onToggleAgravante={toggleAgravante}
              outraDoenca={outraDoenca}
              onOutraDoencaChange={setOutraDoenca}
            />
          )}

          {/* Medicamentos */}
          <MedicamentosSection
            itens={itens}
            onAdicionar={adicionarItem}
            onRemover={removerItem}
            onAtualizar={atualizarItem}
          />

          {/* Informações Adicionais */}
          <InformacoesAdicionais
            validadeDias={validadeDias}
            onValidadeDiasChange={setValidadeDias}
            diagnostico={diagnostico}
            onDiagnosticoChange={setDiagnostico}
            observacoes={observacoes}
            onObservacoesChange={setObservacoes}
          />

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => navigate("/medico")}>
              Cancelar
            </Button>
            <Button
              onClick={irParaConferencia}
              disabled={!paciente}
              className="bg-navy hover:bg-navy-light gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Revisar Receita
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal Criar Paciente */}
      <ModalCriarPaciente
        open={modalCriarPaciente}
        onOpenChange={setModalCriarPaciente}
        novoPaciente={novoPaciente}
        onNovoPacienteChange={setNovoPaciente}
        criando={criandoPaciente}
        onCriar={criarNovoPaciente}
      />
    </div>
  );
}
