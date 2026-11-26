# Plano — Issue #5

## Decisões técnicas

- **Modelo `SavedRoute` e Persistência no MVP:** Criar `SavedRoute` em `core/models/saved-route.model.ts` alinhado ao `docs/architecture.md` (`id`, `user_id`, `name`, `origin`, `destination`, `preferred_time`, `days_of_week: string[]`, `women_only: boolean`, `created_at`) e inicializar a coleção `saved_routes` em `apps/api/db.json`.
- **Serviço de CEP Dedicado (`ViaCepService`):** Criar `ViaCepService` em `core/services/` para consulta assíncrona GET à API pública do ViaCEP (`https://viacep.com.br/ws/{cep}/json/`), encapsulando validação de formato numérico de 8 dígitos (RN16), tratamento de CEP inexistente (`erro: true`) e resiliência de falha/timeout em até 3s (RN17, RNF04). Uso de `toSignal()` e `toObservable()` para pontes reativas entre RxJS e Signals (ID20, ID25).
- **Serviço de Rotas Salvas e Algoritmo de Match (`SavedRouteService`):** Implementar em `core/services/` operações de CRUD de rotas salvas por usuário e método de cruzamento (match) entre as rotas salvas do usuário e caronas abertas de `RideService`. O algoritmo avalia: correspondência parcial de texto normalizado de origem e destino (sem acentos e em minúsculas, igual à US04); coincidência do dia da semana de `departure_time` com `days_of_week`; tolerância de horário de até ±1h em relação a `preferred_time`; respeito ao Modo Elas por Elas (`women_only`); e caronas abertas com `available_seats > 0`.
- **Subcomponentes reutilizáveis com two-way data binding (ID12, ID14):** Criar subcomponente compacto de busca de CEP com `model()` para o CEP e `output()` para o endereço preenchido, e seletor de dias da semana reutilizável com `model()` para seleção múltipla (Segunda a Domingo).
- **Layout Hierárquico do Perfil e Rota Índice (ID18):** Estruturar rotas filhas (`children: [...]`) sob a rota pai `/profile` (`ProfileLayoutComponent`). A rota padrão (`path: ''`, `ProfileMenuComponent`) renderiza a tela de menu de perfil conforme o protótipo (cabeçalho roxo `#4D389B` com logo PassAí, sino de notificações, avatar circular, Nome e Curso do usuário autenticado no `AuthService`, card branco com itens: Editar Perfil, Cadastrar Veículo, Rotas Salvas, Termos de Uso, Ajuda e Sair, além da barra inferior fixa). O item "Rotas Salvas" navega para `/profile/saved-routes`.
- **Layout Unificado em `/profile/saved-routes` (ID18):** A tela `/profile/saved-routes` acomoda o formulário de cadastro/edição no topo (com a mesma identidade visual e tokens do card da Home) e, logo abaixo, as abas "Minhas Rotas" e "Sugestões de Match".
- **Router Component Inputs e Reatividade (ID13, ID16, ID17):** Habilitar `withComponentInputBinding()` e capturar `:id` na rota `/profile/saved-routes/:id/edit` e os query params (`origin`, `destination`, `time`) via Signal `input()` no componente. Usar `effect()` para preencher reativamente o formulário quando receber parâmetros de edição ou da busca da Home.
- **Fidelidade Visual aos Tokens de Design (`docs/design-tokens.md`):** Reutilizar as classes de layout, paleta de cores (`primaria: #4D389B`, `superficie: #FFFFFF`, `fundo: #F2ECEC / #F3EFEF`, `texto: #132436`, `perigo: #DC2626`), tipografia Outfit/Poppins e padrões visuais do `HomeComponent` (evitando sobrescritas de tokens do Tailwind v4 e garantindo 100% dos textos e mensagens em português).
- **Deferrable Views e Controle de Fluxo Moderno (ID6, ID9):** Carregar a lista de sugestões de match sob demanda via `@defer (on viewport)` com blocos `@placeholder` e `@loading`, utilizando `@if` e `@switch` para estados vazios e alternância de abas, validados por testes unitários.
- **Atalho da Home (US04):** Atualizar o botão de cadastro de rotas salvas no estado vazio de `HomeComponent` para navegar para `/profile/saved-routes` enviando `origin`, `destination` e `time` via queryParams.

## Tarefas

- [ ] **Tarefa 1 — Criar modelo `SavedRoute` e implementar `ViaCepService` com resiliência**
  - Cobre: CA1, CA2 e CA10 (ID20, ID25)
  - Teste primeiro: testar no `ViaCepService` a validação de formato de CEP (8 dígitos, limpeza de caracteres especiais), sucesso no GET retornando logradouro, bairro e localidade formatados, tratamento de CEP não encontrado (`erro: true`), tratamento de falha de rede/timeout com fallback gracioso em até 3 segundos sem travar a aplicação.
  - Arquivos previstos: `apps/web/src/app/core/models/saved-route.model.ts`, `apps/web/src/app/core/services/viacep.service.ts`, `apps/web/src/app/core/services/viacep.service.spec.ts`, `apps/api/db.json`

- [ ] **Tarefa 2 — Implementar CRUD e algoritmo de match no `SavedRouteService`**
  - Cobre: CA3, CA4, CA5, CA6, CA7 e CA10
  - Teste primeiro: testar no `SavedRouteService` listagem de rotas por usuário, criação, atualização e exclusão; testar no método de match o cruzamento entre rotas salvas e caronas abertas (normalização de trajeto, compatibilidade de dia da semana, janela de tolerância de ±1h no horário, filtro `women_only` restrito a mulheres e exclusão de caronas lotadas/fechadas).
  - Arquivos previstos: `apps/web/src/app/core/services/saved-route.service.ts`, `apps/web/src/app/core/services/saved-route.service.spec.ts`

- [ ] **Tarefa 3 — Desenvolver subcomponentes reutilizáveis do formulário com `model()` e `output()`**
  - Cobre: CA1, CA2 e CA10 (ID12, ID14)
  - Teste primeiro: testar o subcomponente compacto de busca de CEP (two-way binding via `model()`, chamada ao `ViaCepService`, emissão do endereço preenchido via `output()`, alertas inline não bloqueantes) e o seletor de dias da semana com `model()` para seleção múltipla de Segunda a Domingo.
  - Arquivos previstos: `apps/web/src/app/features/saved-routes/components/cep-search-input/cep-search-input.component.ts`, `cep-search-input.component.html`, `cep-search-input.component.spec.ts`, `apps/web/src/app/features/saved-routes/components/days-selector/days-selector.component.ts`, `days-selector.component.html`, `days-selector.component.spec.ts`

- [ ] **Tarefa 4 — Implementar formulário unificado de Rotas Salvas com validações, `effect()` e fidelidade visual**
  - Cobre: CA1, CA2, CA3 e CA10 (ID6, ID13, ID14)
  - Teste primeiro: testar no componente a validação síncrona dos campos obrigatórios (Nome, Origem, Destino, dias da semana, horário); botão desabilitado com formulário inválido; visibilidade do toggle "Modo Elas por Elas" restrito a usuárias do gênero feminino em `AuthService`; recepção do endereço via busca por CEP; e preenchimento reativo via `effect()` para edição e queryParams. Garantir conformidade com os tokens de `docs/design-tokens.md` (paleta `#4D389B`, inputs `bg-fundo`, labels `text-texto-suave`) e 100% dos textos em português.
  - Arquivos previstos: `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.ts`, `saved-routes.component.html`, `saved-routes.component.spec.ts`

- [ ] **Tarefa 5 — Implementar o menu de Perfil (`/profile`), navegação para "Minhas Rotas", listagem, edição e exclusão**
  - Cobre: CA4, CA5, CA6 e CA10 (ID6, ID14, ID16, ID17, ID18)
  - Teste primeiro: testar a rota índice de Perfil (`ProfileMenuComponent`) com cabeçalho `#4D389B`, sino, avatar, nome/curso do usuário logado e navegação do item "Rotas Salvas" para `/profile/saved-routes`; testar a renderização dos cards das rotas do usuário autenticado com dados completos e badges; exibição de estado vazio amigável quando não houver rotas; confirmação de exclusão removendo o registro no `SavedRouteService`; navegação de edição para `/profile/saved-routes/:id/edit`, capturando `:id` via Signal `input()` e carregando os dados no formulário do topo.
  - Arquivos previstos: `apps/web/src/app/features/profile/pages/profile-layout/profile-layout.component.ts`, `profile-layout.component.html`, `apps/web/src/app/features/profile/pages/profile-menu/profile-menu.component.ts`, `profile-menu.component.html`, `profile-menu.component.spec.ts`, `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.ts`, `saved-routes.component.html`, `saved-routes.component.spec.ts`, `apps/web/src/app/app.routes.ts`

- [ ] **Tarefa 6 — Implementar a aba "Sugestões de Match" com `@defer`, fidelidade visual e navegação para detalhes**
  - Cobre: CA7, CA8 e CA10 (ID6, ID9, ID14)
  - Teste primeiro: testar alternância entre as abas "Minhas Rotas" e "Sugestões de Match"; renderização sob demanda via `@defer (on viewport)` validando blocos `@placeholder` e `@loading`; listagem dos cards de caronas sugeridas com dados completos e design idêntico aos cards da Home (foto, nota, veículo, horário, vagas); estado vazio na ausência de sugestões; e navegação para `/rides/:id` ao clicar em "Ver Carona". Textos 100% em português.
  - Arquivos previstos: `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.ts`, `saved-routes.component.html`, `saved-routes.component.spec.ts`, `apps/web/src/app/features/saved-routes/components/match-suggestions/match-suggestions.component.ts`, `match-suggestions.component.html`, `match-suggestions.component.spec.ts`

- [ ] **Tarefa 7 — Integrar o atalho da Home (US04) com Rotas Salvas via queryParams**
  - Cobre: CA9 e CA10 (ID16, ID17)
  - Teste primeiro: testar no `HomeComponent` que o clique no botão "Cadastrar trajeto em Rotas Salvas" no estado vazio navega para `/profile/saved-routes` passando os queryParams `origin`, `destination` e `time`; testar no componente de Rotas Salvas a captura desses queryParams via Signal inputs e o pré-preenchimento automático dos campos no formulário do topo.
  - Arquivos previstos: `apps/web/src/app/features/home/pages/home/home.component.ts`, `apps/web/src/app/features/home/pages/home/home.component.spec.ts`, `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.ts`, `saved-routes.component.spec.ts`

## Critérios sem tarefa
