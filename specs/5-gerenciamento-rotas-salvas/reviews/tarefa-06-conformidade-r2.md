# Parecer de Conformidade — Tarefa 6
**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA7 — Aba "Sugestões de Match" lista cards de caronas compatíveis com dados completos (foto, motorista, nota média derivada de `reviews`, veículo, horário, vagas). Apontamento 1 da r1 (aceito) resolvido: `getMatchingRides()` agora consome `RideService.getRides()`, que preenche `driver`/`vehicle` a partir de `/users`, `/vehicles` e `/reviews` | atendido | apps/web/src/app/core/services/saved-route.service.ts:73-104, apps/web/src/app/core/services/ride.service.ts (getRides), match-suggestions.component.html:37-153, saved-route.service.spec.ts ("hidrata motorista (nome, foto e nota média derivada de reviews) e veículo…"), ride.service.spec.ts ("hidrata motorista … em getRides") |
| CA7 — Teste de página prova o retorno real do serviço (sem mock de `getMatchingRides`): bloco de integração com `HttpTestingController` que responde `/rides` normalizado + `/users`, `/vehicles`, `/reviews` e confere que o card mostra foto, "Ana Souza", "★ 4.5", "Toyota Corolla · Prata", "07:45", vagas, e que não aparecem os textos de fallback | atendido | saved-routes.component.spec.ts:591-793 |
| CA7 — Estado vazio em português quando nenhuma carona é compatível | atendido | match-suggestions.component.html:20-33, saved-routes.component.spec.ts:795-808 |
| CA8 — "Ver Carona" navega para `/rides/:id` | atendido | match-suggestions.component.html:133-151, saved-routes.component.ts (`navigateToRide`), saved-routes.component.spec.ts:835-850 |
| CA10 (ID6) — `@if`/`@switch` para alternância de abas, estados vazios e erro inline, com testes | atendido | saved-routes.component.html (`@switch` de `activeTab` com `@case ('matches')`, l.331-375), match-suggestions.component.html:1-157, saved-routes.component.spec.ts:713-744 e 810-833 |
| CA10 (ID9) — `@defer (on viewport)` com `@placeholder` e `@loading`, coberto por teste de renderização deferida (`DeferBlockBehavior.Manual`, estados Placeholder → Loading → Complete) | atendido | saved-routes.component.html:350-373, saved-routes.component.spec.ts:746-793 |
| CA10 (ID14) — Comunicação pai ↔ `MatchSuggestionsComponent` só por `input()`/`output()` tipados | atendido | match-suggestions.component.ts:11-14, saved-routes.component.html:351-356 |
| Textos 100% em português | atendido | match-suggestions.component.html, saved-routes.component.html:331-375 |
| Testes | atendido | Rodei o comando do despacho. Na primeira tentativa, o `timeout 300` que eu mesmo coloquei encerrou o processo antes do fim, então ela não conta. Na segunda, sem limite de tempo: 5 arquivos, 65 testes, todos passando |

## Apontamentos

Obs. (não reprova): extrair `getRides()` de `RideService.searchRides()` foi uma refatoração para corrigir o apontamento aceito. O comportamento da Home não mudou: os 20 testes de `home.component.spec.ts` passam. Não acrescenta nada fora do que a spec pede.
