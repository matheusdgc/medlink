import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, GuestRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import LoginPaciente from "./pages/LoginPaciente";
import LoginProfissional from "./pages/LoginProfissional";
import DashboardPaciente from "./pages/DashboardPaciente";
import DashboardMedico from "./pages/DashboardMedico";
import DashboardFarmacia from "./pages/DashboardFarmacia";
import ValidarReceita from "./pages/ValidarReceita";
import VerPaciente from "./pages/VerPaciente";
import ReceitasPaciente from "./pages/ReceitasPaciente";
import NovaReceita from "./pages/NovaReceita/index";
import AtualizarReceita from "./pages/AtualizarReceita";
import PerfilMedico from "./pages/PerfilMedico";
import PerfilFarmacia from "./pages/PerfilFarmacia";
import UnidadesSaude from "./pages/UnidadesSaude";
import AdminUnidadesSaude from "./pages/AdminUnidadesSaude";
import BulasMedicamentos from "./pages/BulasMedicamentos";
import HistoricoDispensacoes from "./pages/HistoricoDispensacoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/servicos" element={<LandingPage />} />
            <Route path="/sobre" element={<LandingPage />} />
            <Route path="/contato" element={<LandingPage />} />

            <Route
              path="/login/paciente"
              element={
                <GuestRoute>
                  <LoginPaciente />
                </GuestRoute>
              }
            />
            <Route
              path="/login/profissional"
              element={
                <GuestRoute>
                  <LoginProfissional />
                </GuestRoute>
              }
            />

            <Route
              path="/paciente"
              element={
                <ProtectedRoute allowedTypes={["PACIENTE"]}>
                  <DashboardPaciente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paciente/receitas"
              element={
                <ProtectedRoute allowedTypes={["PACIENTE"]}>
                  <ReceitasPaciente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paciente/unidades"
              element={
                <ProtectedRoute allowedTypes={["PACIENTE"]}>
                  <UnidadesSaude />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paciente/bulas"
              element={
                <ProtectedRoute allowedTypes={["PACIENTE"]}>
                  <BulasMedicamentos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/medico"
              element={
                <ProtectedRoute allowedTypes={["MEDICO"]}>
                  <DashboardMedico />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medico/nova-receita"
              element={
                <ProtectedRoute allowedTypes={["MEDICO"]}>
                  <NovaReceita />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medico/atualizar-receita"
              element={
                <ProtectedRoute allowedTypes={["MEDICO"]}>
                  <AtualizarReceita />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medico/pacientes"
              element={
                <ProtectedRoute allowedTypes={["MEDICO"]}>
                  <VerPaciente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medico/perfil"
              element={
                <ProtectedRoute allowedTypes={["MEDICO"]}>
                  <PerfilMedico />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medico/bulas"
              element={
                <ProtectedRoute allowedTypes={["MEDICO"]}>
                  <BulasMedicamentos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/farmacia"
              element={
                <ProtectedRoute allowedTypes={["FARMACIA"]}>
                  <DashboardFarmacia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmacia/validar"
              element={
                <ProtectedRoute allowedTypes={["FARMACIA"]}>
                  <ValidarReceita />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmacia/pacientes"
              element={
                <ProtectedRoute allowedTypes={["FARMACIA"]}>
                  <VerPaciente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmacia/perfil"
              element={
                <ProtectedRoute allowedTypes={["FARMACIA"]}>
                  <PerfilFarmacia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmacia/historico"
              element={
                <ProtectedRoute allowedTypes={["FARMACIA"]}>
                  <HistoricoDispensacoes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmacia/bulas"
              element={
                <ProtectedRoute allowedTypes={["FARMACIA"]}>
                  <BulasMedicamentos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/unidades-saude"
              element={
                <ProtectedRoute allowedTypes={["MEDICO", "FARMACIA"]}>
                  <AdminUnidadesSaude />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
