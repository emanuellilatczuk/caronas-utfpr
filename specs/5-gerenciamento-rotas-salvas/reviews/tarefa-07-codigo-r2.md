<Parecer de Código — Tarefa 7>
**Veredito:** APROVADO

## Verificação da Rodada 2 e Evidências
- **Correção do Apontamento 1 da r1 (aceito):** Resolvido integralmente em [home.component.spec.ts](file:///home/leonardocp/ProjetosTSI/caronas-utfpr/apps/web/src/app/features/home/pages/home/home.component.spec.ts#L57-L61) e [home.component.spec.ts](file:///home/leonardocp/ProjetosTSI/caronas-utfpr/apps/web/src/app/features/home/pages/home/home.component.spec.ts#L438-L458). O import de `routes` (`app.routes.ts`) e a asserção acoplada à rota legada `saved-routes/new` foram removidos; o `TestBed` agora usa `provideRouter([])` e exercita exclusivamente o comportamento observável do componente (`['/profile/saved-routes']` com `queryParams: { origin, destination, time }`).
- **Decisão da r1 sobre o Apontamento 2 (recusado pelo usuário):** Respeitada conforme registrado em [tarefa-07-decisoes-r1.md](file:///home/leonardocp/ProjetosTSI/caronas-utfpr/specs/5-gerenciamento-rotas-salvas/reviews/tarefa-07-decisoes-r1.md). O teste de integração com `RouterTestingHarness` + `withComponentInputBinding()` em [saved-routes.component.spec.ts](file:///home/leonardocp/ProjetosTSI/caronas-utfpr/apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.spec.ts#L854-L894) respeita os padrões de roteamento e Signals de [architecture.md](file:///home/leonardocp/ProjetosTSI/caronas-utfpr/docs/architecture.md#L155-L160) (IDs 16 e 17).
- **Isolamento de camadas ([architecture.md](file:///home/leonardocp/ProjetosTSI/caronas-utfpr/docs/architecture.md#L147-L152)):** A comunicação entre `features/home` ([home.component.ts](file:///home/leonardocp/ProjetosTSI/caronas-utfpr/apps/web/src/app/features/home/pages/home/home.component.ts#L85-L90)) e `features/saved-routes` ocorre estritamente via parâmetros de rota na URL (`queryParams`), sem importação direta entre features.
- **Suíte de testes e Linter:**
  - `cd apps/web && CI=1 npx ng test --watch=false`: **16 arquivos passaram (16), 143 testes passaram (143)**.
  - `npx eslint` nos 3 arquivos alterados: **0 erros / 0 avisos**.

## Apontamentos (bloqueiam)
Nenhum.

## Sugestões (não bloqueiam)
- Em [saved-routes.component.spec.ts](file:///home/leonardocp/ProjetosTSI/caronas-utfpr/apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.spec.ts#L856-L879), a configuração de mocks dos services no `TestBed` repete estrutura semelhante aos demais blocos `describe` do arquivo; futuramente pode ser extraída para um helper local de setup se novos cenários forem adicionados.
- Opcionalmente, um caso de teste adicional navegando apenas com `origin` (sem `destination` e `time`) documentaria explicitamente a proteção contra `undefined` já existente no `effect()` do componente.

## Observações fora do escopo deste diff
- **Rota legada sem referências:** `saved-routes/new` (`redirectTo: '/home'`) em `apps/web/src/app/app.routes.ts` não possui mais nenhum chamador na aplicação — candidata a remoção em Issue de manutenção.
- **Mapa de rotas em `docs/architecture.md` (§6):** Lista `/saved-routes`, enquanto a rota implementada na árvore aninhada é `/profile/saved-routes` — candidata a atualização documental de manutenção.
</Parecer de Código — Tarefa 7>
