<Parecer de Conformidade — Tarefa 7>
**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA9 (`spec.md:34`): clique em "Cadastrar trajeto em Rotas Salvas" no estado vazio da Home navega para `/profile/saved-routes` passando os query params `origin`, `destination` e `time` | atendido | `apps/web/src/app/features/home/pages/home/home.component.ts:85-90`; `apps/web/src/app/features/home/pages/home/home.component.spec.ts:425-458` |
| CA9 (`spec.md:34`): campos de Origem, Destino e Horário do formulário no topo de Rotas Salvas pré-populados automaticamente via Signal `input()` correspondentes | atendido | `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.ts:70-72,120-133`; `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.spec.ts:854-894` |
| CA10 — ID16 e ID17 (`spec.md:41`): captura dos query params `origin`, `destination` e `time` diretamente via Signal `input()` habilitado por `withComponentInputBinding()`, coberta por teste | atendido | `apps/web/src/app/app.config.ts:9`; `apps/web/src/app/app.routes.ts:35-57`; `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.ts:69-72`; `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.spec.ts:859-862,881-893` |
| Abandono no meio (`spec.md:54,56`): atalho apenas navega e pré-popula o formulário sem persistir rota salva antes do clique em "Salvar", sob rota protegida por `authGuard` | atendido | `apps/web/src/app/features/home/pages/home/home.component.ts:85-90`; `apps/web/src/app/app.routes.ts:36`; `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.ts:120-133` |
| Resolução da r1 (`tarefa-07-decisoes-r1.md`) e ausência de escopo inflado | atendido | `apps/web/src/app/features/home/pages/home/home.component.spec.ts:57,439-457` (acoplamento a `saved-routes/new` removido; diff restrito a `home.component.ts`, `home.component.spec.ts` e `saved-routes.component.spec.ts`) |
| Suíte de testes executada e verde (`cd apps/web && CI=1 npx ng test --watch=false`) | atendido | 16 arquivos passaram (16), 143 testes passaram (143) |

## Apontamentos
</Parecer de Conformidade — Tarefa 7>
