import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  authApi,
  User,
  LoginProfissionalData,
  LoginPacienteData,
} from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // loginProfissional retorna o tipo do usuario para que a pagina de login
  // possa navegar para o dashboard correto sem depender do query param ?tipo=
  loginProfissional: (data: LoginProfissionalData) => Promise<User["tipo"]>;
  loginPaciente: (data: LoginPacienteData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUser = localStorage.getItem("@medlink:user");
        const storedToken = localStorage.getItem("@medlink:token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));

          try {
            const response = await authApi.getProfile();
            const profileData = response.data.data;

            const updatedUser: User = {
              id: profileData.id,
              email: profileData.email,
              nome: profileData.nome,
              tipo: profileData.tipo,
            };

            setUser(updatedUser);
            localStorage.setItem("@medlink:user", JSON.stringify(updatedUser));
          } catch (error) {
            localStorage.removeItem("@medlink:token");
            localStorage.removeItem("@medlink:refreshToken");
            localStorage.removeItem("@medlink:user");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const loginProfissional = useCallback(async (data: LoginProfissionalData): Promise<User["tipo"]> => {
    try {
      setIsLoading(true);
      const response = await authApi.loginProfissional(data);

      const { user: userData, tokens } = response.data.data;

      localStorage.setItem("@medlink:token", tokens.accessToken);
      localStorage.setItem("@medlink:refreshToken", tokens.refreshToken);
      localStorage.setItem("@medlink:user", JSON.stringify(userData));

      setUser(userData);

      toast.success(`Bem-vindo(a), ${userData.nome}!`);

      // Retorna o tipo para que a pagina de login possa navegar
      // para o dashboard correto (incluindo /admin para ADMIN)
      return userData.tipo;
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao fazer login";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginPaciente = useCallback(async (data: LoginPacienteData) => {
    try {
      setIsLoading(true);
      const response = await authApi.loginPaciente(data);

      const { user: userData, tokens } = response.data.data;

      localStorage.setItem("@medlink:token", tokens.accessToken);
      localStorage.setItem("@medlink:refreshToken", tokens.refreshToken);
      localStorage.setItem("@medlink:user", JSON.stringify(userData));

      setUser(userData);

      toast.success(`Bem-vindo(a), ${userData.nome}!`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "CPF ou Cartão SUS não encontrado";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("@medlink:refreshToken");

      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("@medlink:token");
      localStorage.removeItem("@medlink:refreshToken");
      localStorage.removeItem("@medlink:user");
      setUser(null);
      toast.success("Logout realizado com sucesso");
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      const profileData = response.data.data;

      const updatedUser: User = {
        id: profileData.id,
        email: profileData.email,
        nome: profileData.nome,
        tipo: profileData.tipo,
      };

      setUser(updatedUser);
      localStorage.setItem("@medlink:user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginProfissional,
        loginPaciente,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;
