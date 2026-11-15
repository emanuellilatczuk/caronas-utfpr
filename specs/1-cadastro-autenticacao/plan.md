# Plano — Issue #1

## Decisões técnicas

- **Modelos e Contratos:** Criação das interfaces `User`, `LoginCredentials`, `RegisterData` e `AuthSession` em `apps/web/src/app/core/models/user.model.ts`, alinhadas ao glossário e tabela `users` do `docs/architecture.md`.
- **Validação de Formulários (ID24):** Validadores síncronos puros em `apps/web/src/app/core/validators/auth.validators.ts`: `utfprEmailValidator` (restringindo a `@alunos.utfpr.edu.br` e `@utfpr.edu.br`) e `passwordMatchValidator` (validação cruzada entre `password` e `confirmPassword`).
- **Estado Reativo e Sessão (IDs 10, 11, 21):** `AuthService` singleton em `apps/web/src/app/core/services/auth.service.ts` gerenciando `currentUser = signal<User | null>(null)` e `isAuthenticated = computed(() => !!this.currentUser())`, com persistência e restauração de sessão em `localStorage` (`passai_token`, `passai_user`).
- **Controle de Acesso Funcional (IDs 16, 17, 19):** Functional Guards `authGuard` e `guestGuard` (`CanActivateFn`) em `apps/web/src/app/core/guards/auth.guard.ts`, com captura do parâmetro `returnUrl` no bloqueio de rotas protegidas.
- **Camada Visual e PWA (IDs 2, 4, 5):** Páginas standalone `LoginComponent` e `RegisterComponent` em `apps/web/src/app/features/auth/pages/`, estilizadas com Tailwind CSS mobile-first consumindo tokens semânticos e formulários reativos (`ReactiveFormsModule`).
- **Mock de Dados (E2 / MVP):** Inicialização da coleção `users` no `apps/api/db.json` com campos `id`, `name`, `email`, `password`, `gender`, `avatar_url`, `created_at`.
- **Destino e Roteamento:** Configuração das rotas `/login`, `/register` e da rota protegida `/home` (componente inicial) em `apps/web/src/app/app.routes.ts`.

## Tarefas

- [x] **Tarefa 1 — Modelos de Usuário, Validadores Customizados e Estrutura Inicial do Mock**
  - Cobre: CA4, CA5
  - Teste primeiro: `apps/web/src/app/core/validators/auth.validators.spec.ts` provando rejeição de e-mails não institucionais (`utfprEmailValidator`) e divergência entre senha e confirmação (`passwordMatchValidator`).
  - Arquivos previstos:
    - `apps/web/src/app/core/models/user.model.ts`
    - `apps/web/src/app/core/validators/auth.validators.spec.ts`
    - `apps/web/src/app/core/validators/auth.validators.ts`
    - `apps/api/db.json`

- [x] **Tarefa 2 — AuthService (Registro, Login, Sessão em localStorage e Tratamento de Erros)**
  - Cobre: CA1, CA2, CA3, CA6, CA9
  - Teste primeiro: `apps/web/src/app/core/services/auth.service.spec.ts` cobrindo registro de usuário com sucesso, erro ao tentar registrar e-mail duplicado, login com credenciais válidas e inválidas, restauração de sessão a partir do `localStorage`, logout e tratamento de indisponibilidade da API (status 0 e 5xx).
  - Arquivos previstos:
    - `apps/web/src/app/core/services/auth.service.spec.ts`
    - `apps/web/src/app/core/services/auth.service.ts`

- [x] **Tarefa 3 — Functional Route Guards (authGuard e guestGuard) com returnUrl**
  - Cobre: CA7, CA8
  - Teste primeiro: `apps/web/src/app/core/guards/auth.guard.spec.ts` testando bloqueio de rotas por `authGuard` redirecionando para `/login?returnUrl=...`, liberação para usuário autenticado, e redirecionamento de usuários já logados por `guestGuard` para `/home`.
  - Arquivos previstos:
    - `apps/web/src/app/core/guards/auth.guard.spec.ts`
    - `apps/web/src/app/core/guards/auth.guard.ts`

- [x] **Tarefa 4 — Tela de Cadastro (RegisterComponent) com Formulário Reativo e Feedback Visual**
  - Cobre: CA1, CA3, CA4, CA5, CA9, CA10
  - Teste primeiro: `apps/web/src/app/features/auth/pages/register/register.component.spec.ts` provando botão desabilitado em formulário inválido, mensagens de erro sob campos inválidos (e-mail, senha < 8, confirmação divergente), mensagem de e-mail em uso, tratamento de erro com servidor indisponível mantendo campos preenchidos e formulário limpo na inicialização.
  - Arquivos previstos:
    - `apps/web/src/app/features/auth/pages/register/register.component.spec.ts`
    - `apps/web/src/app/features/auth/pages/register/register.component.ts`
    - `apps/web/src/app/features/auth/pages/register/register.component.html`

- [x] **Tarefa 5 — Tela de Login (LoginComponent) com Redirecionamento e Tratamento de Erro Opaco**
  - Cobre: CA2, CA6, CA9
  - Teste primeiro: `apps/web/src/app/features/auth/pages/login/login.component.spec.ts` provando autenticação com sucesso e navegação para `/home` ou `returnUrl`, exibição de mensagem opaca "E-mail ou senha inválidos" em falhas de autenticação, e exibição de alerta de indisponibilidade de servidor em caso de erro de conexão.
  - Arquivos previstos:
    - `apps/web/src/app/features/auth/pages/login/login.component.spec.ts`
    - `apps/web/src/app/features/auth/pages/login/login.component.ts`
    - `apps/web/src/app/features/auth/pages/login/login.component.html`

- [ ] **Tarefa 6 — Integração de Rotas, Componente Home e Navegação Integrada**
  - Cobre: CA1, CA2, CA7, CA8
  - Teste primeiro: `apps/web/src/app/app.routes.spec.ts` provando a configuração e proteção das rotas `/login`, `/register` e `/home` integradas com os guards e componentes.
  - Arquivos previstos:
    - `apps/web/src/app/features/home/pages/home/home.component.ts`
    - `apps/web/src/app/features/home/pages/home/home.component.html`
    - `apps/web/src/app/app.routes.ts`
    - `apps/web/src/app/app.routes.spec.ts`

## Critérios sem tarefa

*(Nenhum. Todos os critérios de aceite CA1 a CA10 estão mapeados nas tarefas 1 a 6).*
