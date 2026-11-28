<Parecer de Código — Tarefa 6 (r2)>
**Veredito:** APROVADO

Testes: `ng test --watch=false` → 16 arquivos, 142 testes, todos passando.

## Apontamentos (bloqueiam)
Nenhum.

Verificado contra `docs/architecture.md`:
- **Camadas:** os componentes não usam `HttpClient`. `SavedRouteService` delega a `RideService.getRides()` (`saved-route.service.ts`, +`inject(RideService)`).
- **Sintaxe:** `@switch`, `@if` e `@for ... track ride.id` estão corretos. `@defer (on viewport)` tem `@placeholder` e `@loading` (`saved-routes.component.html` ~350-373). Estado em signals, `input()`/`output()` no `MatchSuggestionsComponent` e DI via `inject()`. Não há `standalone: true` redundante.
- **Duplicação:** a hidratação de motorista, nota média (RN20) e veículo agora está só em `RideService.getRides()`. `searchRides` passou a reutilizá-la (`ride.service.ts` ~21-62). Isso corrige o apontamento aceito na r1.
- **Erros:** `refreshMatchingRides` mostra mensagem ao usuário e usa `matchesLoadVersion` contra corrida entre requisições. Não engole a falha.
- **Segredos:** nenhum no diff. `apiUrl` vem de `environment`.
- **Testes:** cobrem a hidratação em `ride.service.spec.ts` (nota média 4.5, motorista sem avaliações), a integração com o serviço em `saved-routes.component.spec.ts`, a alternância de abas e o `@defer`.

## Sugestões (não bloqueiam)
- Extrair o card de carona para um componente apresentacional em `shared/`. O card de `match-suggestions.component.html` espelha o da Home, então o visual pode divergir com o tempo. Já estava na r1.
- Usar `| number:'1.1-1'` na nota média (ID8). Hoje `average_rating` é uma média crua. Com 3 avaliações, por exemplo, sai 4.666666666666667.
- Em `match-suggestions.component.spec.ts` (~74-77), a asserção `classList.contains('rounded-2xl')` acopla o teste a classes de estilo. Já estava na r1.
- `getRides()` busca 4 endpoints a cada troca de aba (`selectTab` chama `refreshMatchingRides`). É aceitável no json-server, mas vale cachear ou usar `resource` quando migrar para o Supabase.
- `selectTab` usa o literal `'routes' | 'matches'`. Um alias de tipo evitaria repetir a união no `activeTab`.

## Observações fora do escopo deste diff
- `searchRides` e `getMatchingRides` ficaram com filtros de elegibilidade separados (`status === 'open'`, vagas, data futura). Vale unificá-los numa Issue de manutenção, para as regras não divergirem.
- O `Gender` não usado em `ride.service.ts`, apontado na r1, foi removido neste diff. Se o lint ainda falhar, é por outro motivo. Não rodei o lint.
</Parecer de Código — Tarefa 6 (r2)>
