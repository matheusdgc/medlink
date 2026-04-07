export interface Paciente {
  id: string;
  cpf: string;
  cartaoSus?: string;
  dataNascimento: string;
  usuario: {
    nome: string;
    email: string;
  };
}

export interface ItemReceita {
  medicamento: string;
  principioAtivo: string;
  dosagem: string;
  formaFarmaceutica: string;
  quantidade: number;
  posologia: string;
  observacao: string;
}

export interface NovoPacienteForm {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: "" | "MASCULINO" | "FEMININO" | "OUTRO";
  telefone: string;
  email: string;
  cartaoSus: string;
  pin: string;
}

export type EtapaReceita = "formulario" | "conferencia";

export const ITEM_VAZIO: ItemReceita = {
  medicamento: "",
  principioAtivo: "",
  dosagem: "",
  formaFarmaceutica: "",
  quantidade: 1,
  posologia: "",
  observacao: "",
};

export const NOVO_PACIENTE_INICIAL: NovoPacienteForm = {
  nome: "",
  cpf: "",
  dataNascimento: "",
  sexo: "",
  telefone: "",
  email: "",
  cartaoSus: "",
  pin: "",
};
