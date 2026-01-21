import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("@medlink:token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("@medlink:refreshToken");

        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data.tokens;

          localStorage.setItem("@medlink:token", accessToken);
          localStorage.setItem("@medlink:refreshToken", newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("@medlink:token");
        localStorage.removeItem("@medlink:refreshToken");
        localStorage.removeItem("@medlink:user");

        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export interface LoginProfissionalData {
  email: string;
  senha: string;
}

export interface LoginPacienteData {
  cpfOuCartaoSus: string;
  dataNascimento: string;
}

export interface RegisterMedicoData {
  email: string;
  senha: string;
  nome: string;
  crm: string;
  ufCrm: string;
  especialidade?: string;
  telefone?: string;
  nomeClinica?: string;
  enderecoClinica?: string;
  telefoneClinica?: string;
}

export interface RegisterFarmaciaData {
  email: string;
  senha: string;
  nome: string;
  cnpj: string;
  crf: string;
  ufCrf: string;
  razaoSocial: string;
  nomeFantasia?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface RegisterPacienteData {
  // Campos obrigatórios
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: "MASCULINO" | "FEMININO" | "OUTRO";
  telefone: string;
  // Campos opcionais
  email?: string;
  cartaoSus?: string;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  tipo: "PACIENTE" | "MEDICO" | "FARMACIA";
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export const authApi = {
  loginProfissional: (data: LoginProfissionalData) =>
    api.post<AuthResponse>("/auth/login/profissional", data),

  loginPaciente: (data: LoginPacienteData) =>
    api.post<AuthResponse>("/auth/login/paciente", data),

  registerMedico: (data: RegisterMedicoData) =>
    api.post<AuthResponse>("/auth/register/medico", data),

  registerFarmacia: (data: RegisterFarmaciaData) =>
    api.post<AuthResponse>("/auth/register/farmacia", data),

  registerPaciente: (data: RegisterPacienteData) =>
    api.post("/auth/register/paciente", data),

  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),

  getProfile: () => api.get("/auth/me"),

  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),

  updateMedicoProfile: (data: {
    nome?: string;
    telefone?: string | null;
    especialidade?: string | null;
    nomeClinica?: string | null;
    enderecoClinica?: string | null;
    telefoneClinica?: string | null;
  }) => api.put("/auth/perfil/medico", data),

  updateFarmaciaProfile: (data: {
    nome?: string;
    telefone?: string | null;
    nomeFantasia?: string | null;
    endereco?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
  }) => api.put("/auth/perfil/farmacia", data),
};

// ==================== PACIENTES API ====================

export const pacientesApi = {
  listar: (params?: { page?: number; limit?: number; busca?: string }) =>
    api.get("/pacientes", { params }),

  meuPerfil: () => api.get("/pacientes/me"),

  buscarPorId: (id: string) => api.get(`/pacientes/${id}`),

  buscarPorDocumento: (documento: string) =>
    api.get(`/pacientes/documento/${documento}`),

  historicoReceitas: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/pacientes/${id}/receitas`, { params }),

  atualizar: (id: string, data: any) => api.put(`/pacientes/${id}`, data),
};

// ==================== RECEITAS API ====================

export interface CriarReceitaData {
  pacienteId: string;
  validadeAte: string;
  observacoes?: string;
  diagnostico?: string;
  itens: {
    medicamento: string;
    principioAtivo?: string;
    dosagem: string;
    formaFarmaceutica?: string;
    quantidade: number;
    posologia: string;
    observacao?: string;
  }[];
}

export const receitasApi = {
  listar: (params?: {
    status?: string;
    pacienteId?: string;
    page?: number;
    limit?: number;
  }) => api.get("/receitas", { params }),

  buscarPorId: (id: string) => api.get(`/receitas/${id}`),

  buscarPorCodigo: (codigo: string) => api.get(`/receitas/codigo/${codigo}`),

  criar: (data: CriarReceitaData) => api.post("/receitas", data),

  atualizar: (id: string, data: any) => api.put(`/receitas/${id}`, data),

  cancelar: (id: string) => api.delete(`/receitas/${id}`),

  dispensar: (
    id: string,
    data?: { observacoes?: string; itensDispensados?: any }
  ) => api.post(`/receitas/${id}/dispensar`, data),

  renovar: (id: string, novaValidadeAte: string) =>
    api.post(`/receitas/${id}/renovar`, { novaValidadeAte }),

  historicoDispensacoes: (params?: {
    dataInicio?: string;
    dataFim?: string;
    pacienteNome?: string;
    page?: number;
    limit?: number;
  }) => api.get("/receitas/historico-dispensacoes", { params }),
};

// ==================== UNIDADES DE SAÚDE API ====================

export interface CriarUnidadeSaudeData {
  nome: string;
  tipo: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep?: string;
  telefone?: string;
  latitude?: number;
  longitude?: number;
}

export interface AtualizarUnidadeSaudeData {
  nome?: string;
  tipo?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  latitude?: number;
  longitude?: number;
  ativo?: boolean;
}

export const unidadesSaudeApi = {
  listar: (params?: {
    page?: number;
    limit?: number;
    busca?: string;
    tipo?: string;
    cidade?: string;
  }) => api.get("/unidades-saude", { params }),

  listarCidades: () => api.get("/unidades-saude/cidades"),

  listarTipos: () => api.get("/unidades-saude/tipos"),

  buscarPorCep: (
    cep: string,
    params?: { page?: number; limit?: number; tipo?: string }
  ) => api.get(`/unidades-saude/buscar-por-cep/${cep}`, { params }),

  buscarPorId: (id: string) => api.get(`/unidades-saude/${id}`),

  criar: (data: CriarUnidadeSaudeData) => api.post("/unidades-saude", data),

  atualizar: (id: string, data: AtualizarUnidadeSaudeData) =>
    api.put(`/unidades-saude/${id}`, data),

  excluir: (id: string) => api.delete(`/unidades-saude/${id}`),
};

// ==================== BULAS API (IA) ====================

export interface BulaIA {
  medicamento: string;
  principioAtivo: string;
  classe: string;
  indicacoes: string;
  posologia: string;
  contraindicacoes: string;
  efeitosColaterais: string;
  interacoes: string;
  armazenamento: string;
  advertencias: string;
  fonte: "IA";
  disclaimer: string;
}

export const bulasApi = {
  consultar: (medicamento: string) =>
    api.get<{ status: string; data: BulaIA }>(
      `/bulas/consultar/${encodeURIComponent(medicamento)}`
    ),

  sugestoes: (termo: string) =>
    api.get<{ status: string; data: string[] }>(
      `/bulas/sugestoes/${encodeURIComponent(termo)}`
    ),
};

export default api;
