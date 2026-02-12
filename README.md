# MedLink - Sistema de Gestao de Receitas Medicas Digitais

MedLink e uma plataforma web completa para gestao de receitas medicas digitais, desenvolvida como Trabalho de Conclusao de Curso (TCC) para o curso tecnico de Desenvolvimento de Sistemas da Etec Dr. Demetrio Azevedo Jr. O sistema conecta medicos, farmacias e pacientes em um fluxo digital seguro para prescricao, validacao e dispensacao de medicamentos.

## Sumario

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalacao](#instalacao)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Seguranca](#seguranca)
- [Licenca](#licenca)
- [Autores](#autores)

## Sobre o Projeto

O MedLink nasceu da necessidade de modernizar o sistema de receitas medicas no Brasil. A plataforma digitaliza todo o processo de prescricao medica, eliminando o uso de papel e reduzindo fraudes, ao mesmo tempo em que facilita o acesso dos pacientes aos seus medicamentos.

### Problema

- Receitas em papel sao facilmente falsificadas
- Dificuldade de rastreabilidade de prescricoes
- Pacientes perdem receitas fisicas
- Farmacias tem dificuldade em validar autenticidade

### Solucao

- Receitas digitais com codigo unico de validacao
- Rastreabilidade completa do ciclo de vida da receita
- Acesso do paciente via CPF e data de nascimento
- Validacao instantanea por codigo ou busca por CPF

## Funcionalidadesgit status

### Para Medicos

- Criacao de receitas digitais com multiplos medicamentos
- Cadastro de pacientes durante a consulta
- Historico completo de prescricoes
- Renovacao de receitas existentes
- Consulta de bulas de medicamentos

### Para Farmacias

- Validacao de receitas por codigo unico
- Busca de receitas ativas por CPF do paciente
- Registro de dispensacao com detalhamento
- Historico de dispensacoes realizadas
- Consulta de bulas de medicamentos

### Para Pacientes

- Acesso as receitas via CPF e data de nascimento
- Visualizacao do historico de medicamentos
- Localizacao de unidades de saude
- Consulta de bulas de medicamentos

## Arquitetura

O projeto segue uma arquitetura cliente-servidor com separacao clara entre frontend e backend:

```
medlink/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # Componentes reutilizaveis
│   ├── contexts/           # Contextos React (Auth)
│   ├── hooks/              # Hooks customizados
│   ├── pages/              # Paginas da aplicacao
│   ├── services/           # Comunicacao com API
│   └── lib/                # Utilitarios
│
└── backend/                # Backend (Node.js + Express)
    ├── prisma/             # Schema e migrations
    └── src/
        ├── config/         # Configuracoes
        ├── middleware/     # Middlewares (auth, rate-limit)
        ├── modules/        # Modulos da aplicacao
        └── types/          # Tipos TypeScript
```

### Modelo de Dados

```
Usuario (1) <-> (1) Paciente | Medico | Farmacia
Paciente (1) <-> (N) Receitas
Medico (1) <-> (N) Receitas
Receita (1) <-> (N) ItemReceita
Receita (1) <-> (0..1) Dispensacao
Farmacia (1) <-> (N) Dispensacoes
```

## Tecnologias

### Frontend

| Tecnologia      | Versao | Descricao                        |
| --------------- | ------ | -------------------------------- |
| React           | 18.x   | Biblioteca para interfaces       |
| TypeScript      | 5.x    | Tipagem estatica                 |
| Vite            | 5.x    | Build tool                       |
| TailwindCSS     | 3.x    | Framework CSS                    |
| shadcn/ui       | -      | Componentes de UI                |
| React Router    | 6.x    | Roteamento                       |
| TanStack Query  | 5.x    | Gerenciamento de estado servidor |
| React Hook Form | 7.x    | Formularios                      |
| Zod             | 3.x    | Validacao de schemas             |
| Axios           | 1.x    | Cliente HTTP                     |

### Backend

| Tecnologia         | Versao | Descricao                   |
| ------------------ | ------ | --------------------------- |
| Node.js            | 18+    | Runtime JavaScript          |
| Express            | 4.x    | Framework web               |
| TypeScript         | 5.x    | Tipagem estatica            |
| Prisma             | 5.x    | ORM                         |
| PostgreSQL         | 14+    | Banco de dados              |
| JWT                | -      | Autenticacao                |
| bcryptjs           | -      | Hash de senhas              |
| Zod                | 3.x    | Validacao                   |
| express-rate-limit | -      | Protecao contra forca bruta |

## Requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior
- npm ou yarn

## Instalacao

### 1. Clonar o Repositorio

```bash
git clone https://github.com/matheusdgc/medlink.git
cd medlink
```

### 2. Instalar Dependencias do Frontend

```bash
npm install
```

### 3. Instalar Dependencias do Backend

```bash
cd backend
npm install
```

### 4. Configurar Variaveis de Ambiente

Crie o arquivo `backend/.env` com base no exemplo:

```env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/medlink?schema=public"
JWT_SECRET="sua-chave-secreta-segura"
JWT_REFRESH_SECRET="sua-chave-refresh-segura"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="30d"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT=3333
```

### 5. Configurar Banco de Dados

```bash
# Criar banco de dados
psql -U postgres -c "CREATE DATABASE medlink;"

# Aplicar schema
cd backend
npm run db:push

# Popular com dados de teste
npm run db:seed
```

### 6. Iniciar a Aplicacao

Em terminais separados:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

O frontend estara disponivel em `http://localhost:5173` e o backend em `http://localhost:3333`.

### Usuarios de Teste

Apos executar o seed, os seguintes usuarios estarao disponiveis:

| Tipo     | Email                   | Senha  | CPF         | Nascimento |
| -------- | ----------------------- | ------ | ----------- | ---------- |
| Medico   | medico@medlink.com      | 123456 | -           | -          |
| Farmacia | farmacia@medlink.com    | 123456 | -           | -          |
| Paciente | maria.silva@email.com   | -      | 12345678900 | 15/05/1998 |
| Paciente | jose.oliveira@email.com | -      | 98765432100 | 22/08/1975 |

OBS: Pacientes fazem login com CPF + Data de Nascimento.

## Estrutura do Projeto

```
medlink/
├── public/                 # Arquivos estaticos
├── src/
│   ├── components/
│   │   ├── layout/         # Header, Footer
│   │   └── ui/             # Componentes shadcn/ui
│   ├── contexts/
│   │   └── AuthContext.tsx # Contexto de autenticacao
│   ├── hooks/              # use-toast, use-mobile
│   ├── lib/
│   │   └── utils.ts        # Funcoes utilitarias
│   ├── pages/              # Paginas da aplicacao
│   ├── services/
│   │   └── api.ts          # Cliente API
│   ├── App.tsx             # Componente raiz
│   └── main.tsx            # Entry point
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # Modelo de dados
│   │   └── seed.ts         # Dados iniciais
│   └── src/
│       ├── config/         # database.ts, env.ts
│       ├── middleware/     # auth.ts, rateLimiter.ts, errorHandler.ts
│       ├── modules/
│       │   ├── auth/       # Autenticacao
│       │   ├── pacientes/  # CRUD pacientes
│       │   ├── receitas/   # CRUD receitas
│       │   ├── bulas/      # Consulta bulas
│       │   └── unidades-saude/
│       ├── types/          # Tipos TypeScript
│       └── index.ts        # Entry point
├── package.json
└── README.md
```

## Seguranca

O sistema implementa diversas camadas de seguranca:

### Autenticacao

- JWT com access token (1 dia) e refresh token (30 dias)
- Senhas hasheadas com bcrypt
- Login de pacientes requer CPF + data de nascimento

### Rate Limiting

| Endpoint            | Limite          | Janela     |
| ------------------- | --------------- | ---------- |
| Global              | 100 requisicoes | 15 minutos |
| Login               | 5 tentativas    | 15 minutos |
| Criacao de conta    | 3 contas        | 1 hora     |
| Operacoes sensiveis | 30 operacoes    | 15 minutos |

### Autorizacao

- Rotas protegidas por tipo de usuario (MEDICO, FARMACIA, PACIENTE)
- Verificacao de propriedade de recursos
- Middleware de validacao com Zod

## API

A documentacao completa da API esta disponivel em github.com/matheusdgc/medlink-api.

### Principais Endpoints

```
POST /api/auth/login/profissional  - Login medico/farmacia
POST /api/auth/login/paciente      - Login paciente
GET  /api/auth/me                  - Perfil do usuario
GET  /api/receitas                 - Listar receitas
POST /api/receitas                 - Criar receita
POST /api/receitas/:id/dispensar   - Dispensar receita
GET  /api/pacientes                - Listar pacientes
GET  /api/unidades-saude           - Listar unidades
GET  /api/bulas/consultar/:nome    - Consultar bula
```

## Scripts Disponiveis

### Frontend

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de producao
npm run preview      # Visualizar build
npm run lint         # Executar linter
```

### Backend

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Compilar TypeScript
npm run start        # Iniciar build de producao
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar schema no banco
npm run db:migrate   # Criar migration
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco de dados
```

## Licenca

Este projeto esta licenciado sob a Licenca MIT - consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

Este projeto foi desenvolvido para fins academicos como Trabalho de Conclusao de Curso.

## Autores

Desenvolvido como Trabalho de Conclusao de Curso (TCC) para o curso tecnico de Desenvolvimento de Sistemas da Etec Dr. Demetrio Azevedo Jr.

Equipe:

- Matheus D. Gomes Chichura
- Ricardo Santos Orestes Junior
- Joao Victor da Silva Paula
- Pedro Luciano Batista de Paula

---

Para mais informacoes sobre a API, consulte a documentacao em <b>github.com/matheusdgc/medlink-api</b>.
