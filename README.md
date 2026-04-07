# MedLink — Sistema de Receitas Médicas Digitais

Plataforma web completa para gestão de receitas médicas digitais, desenvolvida como **Trabalho de Conclusão de Curso (TCC)** para o curso técnico de Desenvolvimento de Sistemas da **Etec Dr. Demétrio Azevedo Jr.**

O sistema conecta médicos, farmácias e pacientes em um fluxo digital seguro para prescrição, validação e dispensação de medicamentos — substituindo o papel por receitas digitais rastreáveis com QR Code.

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework UI | React 18 + Vite |
| Linguagem | TypeScript |
| Roteamento | React Router DOM v6 |
| Estado global | React Context API |
| Requisições HTTP | Axios + TanStack Query |
| Formulários | React Hook Form + Zod |
| Componentes | shadcn/ui + Radix UI |
| Estilo | Tailwind CSS |
| Gráficos | Recharts |
| Exportação PDF | jsPDF 2.5.1 + jspdf-autotable (CDN) |
| Exportação Excel | SheetJS / xlsx (CDN) |
| QR Code (geração) | qrcode-generator (CDN) |
| QR Code (leitura) | html5-qrcode (CDN) |
| Deploy | Vercel |

## Funcionalidades por Perfil

### Médico
- Dashboard com resumo de atividade (receitas ativas, dispensadas, vencidas)
- Emissão de novas receitas com múltiplos medicamentos, posologia, diagnóstico e observações
- Listagem e filtragem de receitas emitidas
- Atualização e cancelamento de receitas
- Busca e cadastro de pacientes
- Visualização do prontuário resumido do paciente
- Consulta de bulas de medicamentos (geradas por IA)
- Gerenciamento de unidades de saúde vinculadas
- Exportação de relatórios em PDF e Excel com filtros por período

### Farmácia
- Dashboard com atividade do dia
- Validação de receitas por código digitado **ou câmera (scan de QR Code)**
- Exibição de todos os dados da receita antes da dispensação
- Registro de dispensação com confirmação
- Histórico de dispensações realizadas

### Paciente
- Login via CPF
- Listagem de todas as receitas em aberto e históricas
- Visualização detalhada de cada receita
- **Exportação da receita individual em PDF** com QR Code integrado
- Cópia do código da receita com um clique

### Admin Master
- Acesso a todos os módulos do sistema (médico, farmácia, paciente)
- Dashboard executivo com totais globais (receitas, pacientes, médicos, farmácias)
- Gerenciamento de receitas: listagem de todas as receitas do sistema, busca por paciente, filtro por status
- **Deleção permanente** de receitas com confirmação detalhada
- Acesso aos relatórios analíticos

## Estrutura de Telas

```
/                           → Landing page pública
/login                      → Login paciente (CPF)
/login/profissional         → Login médico, farmácia e admin (e-mail)
/registro                   → Cadastro de médico/farmácia

/medico                     → Dashboard médico
/medico/nova-receita        → Emissão de nova receita
/medico/receitas            → Listagem de receitas
/medico/receitas/:id/editar → Edição de receita
/medico/pacientes           → Busca de pacientes
/medico/pacientes/:id       → Prontuário do paciente
/medico/bulas               → Consulta de bulas
/medico/perfil              → Perfil e dados do médico
/medico/relatorios          → Relatórios exportáveis (PDF/Excel)

/farmacia                   → Dashboard farmácia
/farmacia/validar           → Validação de receita (código ou QR scan)
/farmacia/historico         → Histórico de dispensações
/farmacia/perfil            → Perfil da farmácia

/paciente                   → Dashboard paciente
/paciente/receitas          → Receitas do paciente

/admin                      → Dashboard admin
/admin/gerenciar-receitas   → Gerenciamento e deleção de receitas
/admin/relatorios           → Relatórios do sistema

/unidades-saude             → Listagem pública de unidades
/admin/unidades-saude       → Gerenciamento de unidades (médico/farmácia/admin)
```

## Arquitetura do Frontend

### Autenticação e Proteção de Rotas

O `AuthContext` gerencia o estado do usuário autenticado. O componente `ProtectedRoute` verifica o tipo do usuário e redireciona automaticamente caso ele tente acessar uma rota não autorizada:

```typescript
// dashboardRoutes: mapa centralizado de redirecionamento
const dashboardRoutes = {
  PACIENTE: "/paciente",
  MEDICO:   "/medico",
  FARMACIA: "/farmacia",
  ADMIN:    "/admin",
};
```

### Exportação de PDF com QR Code

As receitas individuais são exportadas com a função `exportarReceitaPdf()` em `src/utils/exportarReceita.ts`. O PDF é gerado diretamente no navegador via **jsPDF** (sem servidor), com um QR Code embarcado gerado pelo **qrcode-generator** e inserido como imagem PNG via `doc.addImage()`.

O PDF inclui: cabeçalho MedLink, QR Code no canto superior direito, bloco do paciente, bloco do médico com CRM/especialidade, itens numerados com posologia e quantidade, observações, e código de verificação no rodapé.

### Scanner de QR Code

A tela de validação da farmácia (`/farmacia/validar`) usa **html5-qrcode** para ler QR Codes via câmera do dispositivo. O scanner é montado dentro de um `useEffect` com lifecycle controlado via `useRef`, garantindo que o elemento DOM `div#qr-reader-element` exista antes da inicialização.

Ao escanear, o código é passado diretamente como parâmetro para a função de busca (evitando o problema de closure de state do React com callbacks assíncronos).

### Bibliotecas via CDN

Para evitar aumentar o bundle do Vite, as bibliotecas de exportação são carregadas como scripts no `index.html`:

```html
<script src="jspdf.umd.min.js"></script>
<script src="jspdf.plugin.autotable.min.js"></script>
<script src="xlsx.full.min.js"></script>
<script src="qrcode.min.js"></script>
<script src="html5-qrcode.min.js"></script>
```

Elas ficam disponíveis como globais em `window` e são acessadas com `(window as any).jspdf`, `(window as any).XLSX`, etc.

## Instalação e Configuração

### 1. Pré-requisitos

- Node.js 18+
- Backend `medlink-api` rodando (veja o repositório da API)

### 2. Clonar e instalar

```bash
git clone https://github.com/matheusdgc/medlink
cd medlink
npm install
```

### 3. Variável de ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_API_URL=http://localhost:3000/api
```

Para produção (Vercel), configure a variável `VITE_API_URL` apontando para a URL da API em produção.

### 4. Executar

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
```

O app estará disponível em `http://localhost:5173`.

## Usuários de Teste

| Tipo | E-mail | Senha | CPF |
|---|---|---|---|
| Médico | medico@medlink.com | 123456 | — |
| Farmácia | farmacia@medlink.com | 123456 | — |
| Paciente | — | — | 000.000.000-00 |
| Admin | admin@medlink.com | 123456 | — |

Os usuários são criados ao executar `npx prisma db seed` no backend.

## Deploy

O frontend está configurado para deploy na **Vercel** com o arquivo `vercel.json` já incluso no repositório (necessário para que o React Router funcione corretamente com o servidor de arquivos estáticos da Vercel, redirecionando todas as rotas para `index.html`).

## Projeto

Este sistema foi desenvolvido como TCC do curso técnico de Desenvolvimento de Sistemas na **Etec Dr. Demétrio Azevedo Jr.** O objetivo é demonstrar o desenvolvimento completo de uma aplicação web full-stack com autenticação, controle de acesso, integrações externas (IA para bulas, QR Code) e exportação de documentos.
