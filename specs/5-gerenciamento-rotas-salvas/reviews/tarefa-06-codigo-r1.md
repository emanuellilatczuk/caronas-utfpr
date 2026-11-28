# Parecer de Código — Tarefa 6
**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

## Sugestões (não bloqueiam)
- **Extração futura de card de carona compartilhado em `shared/`:** A estrutura de card de carona em `apps/web/src/app/features/saved-routes/components/match-suggestions/match-suggestions.component.html:37-153` espelha o card da Home (`apps/web/src/app/features/home/pages/home/home.component.html:299-389`), mudando apenas o rótulo/ação do botão e o badge `women_only`. Quando novas telas de listagem (`rides`) entrarem, vale extrair um componente apresentacional em `shared/` (`architecture.md`, seção 3.2) para evitar divergência visual.
- **Formatação declarativa de nota média (`DecimalPipe`):** Em `apps/web/src/app/features/saved-routes/components/match-suggestions/match-suggestions.component.html:81`, `{{ ride.driver?.average_rating }}` exibe o número bruto; caso a média calculada gere dízima (ex.: `4.666666666666667`), aplicar `| number: '1.1-1'` (ID8) evita quebra visual no badge.
- **Evitar asserções de classes utilitárias em testes unitários:** Em `apps/web/src/app/features/saved-routes/components/match-suggestions/match-suggestions.component.spec.ts:74-77`, testar `classList.contains('rounded-2xl')` acopla o teste a ajustes finos de estilo; prefira focar exclusivamente no comportamento, semântica ARIA e conteúdo renderizado.

## Observações fora do escopo deste diff
- **Hidratação de `driver` e `vehicle` em `SavedRouteService.getMatchingRides()` (`apps/web/src/app/core/services/saved-route.service.ts:71-102`):** Implementado na Tarefa 2, o método consulta apenas `GET /rides` no `json-server`, sem hidratar `driver` (`users` + cálculo de `average_rating` em `reviews`, conforme RN20 em `docs/architecture.md:190`) nem `vehicle` (`vehicles`), diferentemente de `RideService.searchRides()`. Em execução real contra `apps/api/db.json`, os cards sugeridos exibirão os fallbacks (`Motorista`, `Sem avaliações`, `Veículo indisponível`) até que a hidratação seja unificada no serviço.
- **Erro pré-existente no linter (`apps/web/src/app/core/services/ride.service.ts:5`):** O import `'Gender'` não é utilizado e faz `npm run lint -w apps/web` falhar (`@typescript-eslint/no-unused-vars`). Candidato a correção de manutenção.
