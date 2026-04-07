import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  pacientesApi,
  receitasApi,
  authApi,
  CriarReceitaData,
  RegisterPacienteData,
} from "@/services/api";
import {
  Paciente,
  ItemReceita,
  NovoPacienteForm,
  EtapaReceita,
  ITEM_VAZIO,
  NOVO_PACIENTE_INICIAL,
} from "./types";
import { calcularDataValidade } from "./utils";

export function useNovaReceita() {
  // Busca de paciente
  const [cpfBusca, setCpfBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [paciente, setPaciente] = useState<Paciente | null>(null);

  // Dados da receita
  const [validadeDias, setValidadeDias] = useState(30);
  const [diagnostico, setDiagnostico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ItemReceita[]>([{ ...ITEM_VAZIO }]);

  // Anamnese
  const [possuiAlergia, setPossuiAlergia] = useState(false);
  const [alergias, setAlergias] = useState("");
  const [possuiAgravante, setPossuiAgravante] = useState(false);
  const [agravantes, setAgravantes] = useState<string[]>([]);
  const [outraDoenca, setOutraDoenca] = useState("");

  // Envio
  const [enviando, setEnviando] = useState(false);
  const [receitaCriada, setReceitaCriada] = useState<string | null>(null);

  // Etapa de conferencia
  const [etapa, setEtapa] = useState<EtapaReceita>("formulario");

  // Modal de criar paciente
  const [modalCriarPaciente, setModalCriarPaciente] = useState(false);
  const [criandoPaciente, setCriandoPaciente] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState<NovoPacienteForm>(
    NOVO_PACIENTE_INICIAL
  );

  const buscarPaciente = useCallback(async () => {
    if (!cpfBusca.trim()) {
      toast.error("Digite o CPF do paciente");
      return;
    }

    setBuscando(true);
    try {
      const response = await pacientesApi.buscarPorDocumento(cpfBusca);
      setPaciente(response.data.data);
      toast.success("Paciente encontrado!");
    } catch {
      setPaciente(null);
      toast.error(
        <div className="flex flex-col gap-2">
          <span>Paciente não encontrado</span>
          <button
            onClick={() => {
              setNovoPaciente((prev) => ({ ...prev, cpf: cpfBusca }));
              setModalCriarPaciente(true);
            }}
            className="text-teal underline text-left"
          >
            Cadastrar novo paciente?
          </button>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setBuscando(false);
    }
  }, [cpfBusca]);

  const limparPaciente = useCallback(() => {
    setPaciente(null);
    setCpfBusca("");
  }, []);

  const abrirModalCriarPaciente = useCallback(() => {
    setNovoPaciente((prev) => ({ ...prev, cpf: cpfBusca }));
    setModalCriarPaciente(true);
  }, [cpfBusca]);

  const criarNovoPaciente = useCallback(async () => {
    // Campos obrigatorios
    if (!novoPaciente.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!novoPaciente.cpf.trim()) {
      toast.error("CPF é obrigatório");
      return;
    }
    if (!novoPaciente.dataNascimento) {
      toast.error("Data de nascimento é obrigatória");
      return;
    }
    if (!novoPaciente.sexo) {
      toast.error("Sexo é obrigatório");
      return;
    }
    if (!novoPaciente.telefone.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }

    setCriandoPaciente(true);
    try {
      const dados: RegisterPacienteData = {
        nome: novoPaciente.nome,
        cpf: novoPaciente.cpf,
        dataNascimento: new Date(novoPaciente.dataNascimento).toISOString(),
        sexo: novoPaciente.sexo as "MASCULINO" | "FEMININO" | "OUTRO",
        telefone: novoPaciente.telefone,
        email: novoPaciente.email || undefined,
        cartaoSus: novoPaciente.cartaoSus || undefined,
        pin: novoPaciente.pin?.length === 6 ? novoPaciente.pin : undefined,
      };

      await authApi.registerPaciente(dados);
      toast.success("Paciente cadastrado com sucesso!");

      // Buscar o paciente recém-criado
      const response = await pacientesApi.buscarPorDocumento(novoPaciente.cpf);
      setPaciente(response.data.data);

      setModalCriarPaciente(false);
      setNovoPaciente(NOVO_PACIENTE_INICIAL);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erro ao cadastrar paciente"
      );
    } finally {
      setCriandoPaciente(false);
    }
  }, [novoPaciente]);

  // ==================== ITENS DA RECEITA ====================

  const adicionarItem = useCallback(() => {
    setItens((prev) => [...prev, { ...ITEM_VAZIO }]);
  }, []);

  const removerItem = useCallback((index: number) => {
    setItens((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  const atualizarItem = useCallback(
    (index: number, campo: keyof ItemReceita, valor: string | number) => {
      setItens((prev) => {
        const novosItens = [...prev];
        novosItens[index] = { ...novosItens[index], [campo]: valor };
        return novosItens;
      });
    },
    []
  );

  // ==================== AGRAVANTES ====================

  const toggleAgravante = useCallback((agravante: string) => {
    setAgravantes((prev) =>
      prev.includes(agravante)
        ? prev.filter((a) => a !== agravante)
        : [...prev, agravante]
    );
  }, []);

  // ==================== VALIDAÇÃO ====================

  const validarFormulario = useCallback((): boolean => {
    if (!paciente) {
      toast.error("Selecione um paciente");
      return false;
    }

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      if (!item.medicamento.trim()) {
        toast.error(`Item ${i + 1}: Nome do medicamento é obrigatório`);
        return false;
      }
      if (!item.dosagem.trim()) {
        toast.error(`Item ${i + 1}: Dosagem é obrigatória`);
        return false;
      }
      if (!item.posologia.trim()) {
        toast.error(`Item ${i + 1}: Posologia é obrigatória`);
        return false;
      }
      if (item.quantidade < 1) {
        toast.error(`Item ${i + 1}: Quantidade deve ser maior que 0`);
        return false;
      }
    }

    return true;
  }, [paciente, itens]);

  // ==================== NAVEGAÇÃO DE ETAPAS ====================

  const irParaConferencia = useCallback(() => {
    if (!validarFormulario()) return;
    setEtapa("conferencia");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [validarFormulario]);

  const voltarParaFormulario = useCallback(() => {
    setEtapa("formulario");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ==================== CRIAR RECEITA ====================

  const criarReceita = useCallback(async () => {
    if (!validarFormulario()) return;

    setEnviando(true);
    try {
      const validade = calcularDataValidade(validadeDias);

      const dados: CriarReceitaData = {
        pacienteId: paciente!.id,
        validadeAte: validade.toISOString(),
        diagnostico: diagnostico || undefined,
        observacoes: observacoes || undefined,
        itens: itens.map((item) => ({
          medicamento: item.medicamento,
          principioAtivo: item.principioAtivo || undefined,
          dosagem: item.dosagem,
          formaFarmaceutica: item.formaFarmaceutica || undefined,
          quantidade: item.quantidade,
          posologia: item.posologia,
          observacao: item.observacao || undefined,
        })),
      };

      const response = await receitasApi.criar(dados);
      const codigoReceita = response.data.data.codigo;

      setReceitaCriada(codigoReceita);
      toast.success("Receita criada com sucesso!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao criar receita");
    } finally {
      setEnviando(false);
    }
  }, [validarFormulario, validadeDias, paciente, diagnostico, observacoes, itens]);

  // ==================== RESET ====================

  const resetarFormulario = useCallback(() => {
    setReceitaCriada(null);
    setPaciente(null);
    setCpfBusca("");
    setItens([{ ...ITEM_VAZIO }]);
    setDiagnostico("");
    setObservacoes("");
    setPossuiAlergia(false);
    setAlergias("");
    setPossuiAgravante(false);
    setAgravantes([]);
    setOutraDoenca("");
    setEtapa("formulario");
  }, []);

  return {
    // Estado do paciente
    cpfBusca,
    setCpfBusca,
    buscando,
    paciente,
    buscarPaciente,
    limparPaciente,

    // Modal criar paciente
    modalCriarPaciente,
    setModalCriarPaciente,
    criandoPaciente,
    novoPaciente,
    setNovoPaciente,
    abrirModalCriarPaciente,
    criarNovoPaciente,

    // Dados da receita
    validadeDias,
    setValidadeDias,
    diagnostico,
    setDiagnostico,
    observacoes,
    setObservacoes,

    // Itens
    itens,
    adicionarItem,
    removerItem,
    atualizarItem,

    // Anamnese
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

    // Envio
    enviando,
    receitaCriada,
    criarReceita,

    // Navegação
    etapa,
    irParaConferencia,
    voltarParaFormulario,
    resetarFormulario,
  };
}
