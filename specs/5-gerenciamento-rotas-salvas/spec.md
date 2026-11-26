---
issue: 5
status: aprovada
---

# US06 — Gerenciamento de Rotas Salvas com Autopreenchimento via CEP e Sugestões de Match

## O problema

Estudantes e servidores da comunidade acadêmica da UTFPR que possuem rotas e horários habituais diários (como Casa ↔ Campus) enfrentam a necessidade repetitiva e cansativa de realizar buscas manuais ou cadastrar caronas todos os dias, além da lentidão na digitação de endereços completos no celular. Sem um mecanismo integrado que cruze preferências rotineiras com as caronas publicadas, muitas caronas compatíveis partem com assentos vazios enquanto passageiros continuam aguardando no ponto de ônibus.

## A história

**Como** Usuário autenticado (Passageiro ou Motorista),  
**eu quero** cadastrar minhas rotas frequentes utilizando o CEP para preenchimento automático do endereço e visualizar sugestões de caronas compatíveis,  
**para que** eu possa agilizar o cadastro de rotas recorrentes e receber opções de trajetos sem precisar buscar manualmente todos os dias.

## Critérios de aceite

- [ ] **CA1 — Autopreenchimento por CEP em Origem e Destino:** Dado que estou no formulário de Rota Salva (no topo da tela `/profile/saved-routes`), quando clico no atalho "Buscar por CEP" no campo de Origem ou Destino, insiro um CEP válido de 8 dígitos (formato com ou sem hífen: `00000-000` ou `00000000`) e aciono a busca, então o sistema realiza uma requisição assíncrona (GET) à API pública do ViaCEP (`https://viacep.com.br/ws/{cep}/json/`) e preenche automaticamente o campo de texto correspondente com `logradouro, bairro - cidade`, mantendo o campo aberto e editável para que o usuário possa complementar com número residencial ou ponto de referência.
- [ ] **CA2 — Tratamento de CEP inválido, inexistente ou indisponibilidade da API (RN16, RN17, RNF04):** Dado que estou utilizando a busca por CEP, quando insiro um CEP com menos de 8 dígitos ou caracteres não numéricos, ou informo um CEP não localizado na base postal ("erro": true), ou a API externa do ViaCEP estiver indisponível/retornar falha de rede/exceder o tempo de resposta em até 3 segundos, então o sistema não trava a aplicação, encerra a busca com aviso inline não bloqueante ("Informe um CEP válido com 8 dígitos", "CEP não encontrado" ou "Não foi possível buscar o CEP automaticamente") e libera o campo de texto principal para digitação manual direta do endereço.
- [ ] **CA3 — Cadastro de Rota Salva com validação no formulário unificado:** Dado que sou um usuário autenticado no formulário no topo de `/profile/saved-routes`, quando preencho Nome da Rota, Origem, Destino, seleciono ao menos 1 dia da semana (Segunda a Domingo), informo o Horário preferido (`preferred_time`) e opcionalmente marco o toggle "Modo Elas por Elas" (visível apenas para usuárias com gênero feminino autenticadas no `AuthService`) e clico em "Salvar Rota", então a rota é salva com sucesso vinculada ao meu `user_id` e exibida imediatamente na aba "Minhas Rotas" logo abaixo do formulário. Se algum campo obrigatório não for preenchido, o botão de salvar permanece desabilitado e os campos tocados exibem mensagens de erro específicas sob os inputs.
- [ ] **CA4 — Listagem de Minhas Rotas e estado vazio amigável:** Dado que acesso `/profile/saved-routes`, quando a aba "Minhas Rotas" abaixo do formulário é exibida, então o sistema lista os cards de cada rota com Nome, Origem, Destino, dias da semana selecionados, horário preferido e badge "Modo Elas por Elas" (se ativado), acompanhados dos botões de ação para Editar e Excluir. Caso não haja nenhuma rota salva cadastrada, é exibido um estado vazio informativo com a ilustração/ícone do domínio e mensagem orientando o cadastro no formulário acima.
- [ ] **CA5 — Edição de Rota Salva existente via rota com Signal input:** Dado que estou na listagem "Minhas Rotas", quando clico no botão "Editar" de uma rota salva, então o sistema navega para `/profile/saved-routes/:id/edit` (capturando `:id` via Signal `input()` no componente conforme ID16/ID17), carrega os dados persistidos da rota no formulário do topo em modo de edição e, ao salvar as alterações válidas, atualiza o registro no banco de dados e retorna para `/profile/saved-routes` com a listagem atualizada.
- [ ] **CA6 — Exclusão de Rota Salva com confirmação:** Dado que estou na listagem "Minhas Rotas", quando clico no botão "Excluir" de uma rota e confirmo a exclusão no diálogo de confirmação, então o sistema remove o registro permanentemente de `saved_routes` e atualiza a listagem na tela. Caso a exclusão seja cancelada no diálogo, a rota permanece intacta.
- [ ] **CA7 — Cruzamento e Sugestões de Match de Caronas Compatíveis:** Dado que possuo rotas salvas cadastradas e acesso a aba "Sugestões de Match", quando o sistema consulta as caronas abertas (`rides`), então lista os cards de caronas compatíveis que cumpram simultaneamente todos os seguintes critérios:
  1. Origem e Destino coincidentes por correspondência textual parcial normalizada (sem acentos e em minúsculas, idêntico à regra da US04);
  2. Dia da semana da partida (`departure_time`) coincidente com pelo menos um dos dias em `days_of_week` da rota salva;
  3. Horário de partida da carona dentro de uma janela de tolerância de até ±1h em relação ao `preferred_time` da rota salva;
  4. Modo Elas por Elas estritamente respeitado: caronas com `women_only: true` só são sugeridas para usuárias do gênero feminino cadastradas;
  5. Carona com status `open` e com `available_seats > 0`.
  Se nenhuma carona atender aos critérios, exibe estado vazio indicando ausência de caronas compatíveis no momento.
- [ ] **CA8 — Ação na Sugestão de Match (Redirecionamento para Detalhes):** Dado que estou visualizando a lista de caronas sugeridas na aba "Sugestões de Match", quando clico no botão "Ver Carona" de um card sugerido, então o sistema navega para a rota `/rides/:id`, permitindo que o usuário visualize todos os dados da carona para posterior solicitação de vaga (fronteira com US04/US05).
- [ ] **CA9 — Atalho vindo da Busca da Home (US04):** Dado que realizei uma busca por caronas em `/home` sem ofertas encontradas e clico no botão "Cadastrar trajeto em Rotas Salvas", quando o sistema navega para `/profile/saved-routes` com os query params `origin`, `destination` e `time`, então os campos de Origem, Destino e Horário do formulário no topo são automaticamente pré-populados via Signal `input()` correspondentes.
- [ ] **CA10 — Conformidade Arquitetural Angular 20+ e Indicadores da Disciplina com Cobertura de Testes:** Dado o desenvolvimento da funcionalidade no frontend, a solução e a suíte de testes unitários devem atender estritamente aos padrões:
  - **ID6 (Controle de Fluxo):** Uso obrigatório de `@if` e `@switch` para estados vazios, erros inline e alternância entre as abas "Minhas Rotas" e "Sugestões de Match", validados por testes unitários;
  - **ID9 (Deferrable Views):** A seção/componente de Sugestões de Match deve ser carregada sob demanda via `@defer (on viewport)` com blocos `@placeholder` e `@loading`, coberta por teste unitário de renderização deferida;
  - **ID12 (model()):** Utilização de `model()` para two-way data binding em subcomponente reutilizável (seletor de dias da semana `DaysOfWeekSelectorComponent` ou input de CEP `CepSearchInputComponent`);
  - **ID13 (effect()):** Utilização de `effect()` para efeito colateral reativo na sincronização dos dados (carregamento/preenchimento reativo do formulário em modo edição ou aplicação da resposta do CEP no campo de endereço);
  - **ID14 (input() / output()):** Comunicação entre componentes pai e filhos realizada exclusivamente por `input()` e `output()` tipados;
  - **ID16 e ID17 (Router Component Inputs):** Captura de parâmetros dinâmicos de rota (`:id`) e query params de busca (`origin`, `destination`, `time`) diretamente através de Signal `input()` no componente habilitado por `withComponentInputBinding()`;
  - **ID18 (Rotas filhas aninhadas):** Estrutura de rotas filhas (`children: [...]`) sob o layout base de `/profile` no `app.routes.ts`;
  - **ID20 e ID25 (Integração Externa e Reatividade):** Integração com ViaCEP encapsulada em serviço dedicado (`ViaCepService`), utilizando `toSignal()` e `toObservable()` para pontes reativas entre RxJS e Signals.

## Fora de escopo

- Solicitar reserva de vaga ou emissão do código PIN de 4 dígitos diretamente a partir da lista de sugestões (pertence à US05).
- Rastreamento por mapa interativo, GPS em tempo real ou geolocalização por latitude/longitude.
- Disparo de notificações por push, e-mail ou SMS sobre novos matches (Fora de Escopo do PRD).
- Implementação funcional dos demais itens do menu de Perfil (Editar Perfil, Cadastrar Veículo, Termos de Uso, Ajuda), mantidos apenas como placeholders visuais nesta entrega.

## Abandono no meio

Caso o usuário inicie o preenchimento ou edição de uma rota salva e feche a aba, retorne à tela anterior ou navegue pelo menu sem acionar o botão "Salvar", os dados informados não são persistidos e o estado original é mantido intacto.
Caso a consulta externa ao ViaCEP esteja em processamento e o usuário cancele a busca, apague o campo ou feche a tela, a resposta assíncrona recebida posteriormente é ignorada sem sobrescrever entradas manuais.
Caso a sessão do usuário seja encerrada durante o uso da tela, o `authGuard` bloqueia a navegação e redireciona para `/login`.

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| A coleção `saved_routes` é persistida localmente no `apps/api/db.json` via json-server durante o MVP e migrará para o Supabase na E3. | Migração E3 |
| A rota de detalhes da carona (`/rides/:id`) receberá a implementação completa de solicitação de vaga e validação de PIN na US05. | Issue #4 (US05) |
| As opções de menu de Perfil além de Rotas Salvas possuem apenas cascas visuais de navegação. | Issues correspondentes |

## Depende de

- Autenticação ativa e perfil do usuário logado (com identificador `id` e `gender`) providos por `AuthService` (US01).
- Coleção de caronas abertas provida por `RideService` e `apps/api/db.json` (US03 e US04).

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |
