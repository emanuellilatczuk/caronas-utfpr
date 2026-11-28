<Parecer de Conformidade — Tarefa 7>
**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA9: clique em "Cadastrar trajeto em Rotas Salvas" na Home navega para `/profile/saved-routes` com queryParams `origin`, `destination`, `time` (e só esses) | atendido | home.component.ts `navigateToSavedRouteRegistration` (diff: rota `/profile/saved-routes`, `date` removido); home.component.spec.ts ~L450 (`toHaveBeenCalledWith(['/profile/saved-routes'], {queryParams:{origin,destination,time}})`) |
| CA9: campos Origem/Destino/Horário pré-preenchidos via Signal `input()` | atendido | saved-routes.component.ts L70-72 (`origin`/`destination`/`time` como `input<string>()`) e effect L120-133 (já existiam). O teste novo no saved-routes.component.spec.ts (fim do arquivo) usa `RouterTestingHarness` + `withComponentInputBinding()` e navega para `/profile/saved-routes?origin=...&destination=...&time=14:00`. Ele verifica o `value` dos 3 inputs no DOM. Prova o fluxo de ponta a ponta. |
| CA10 ID16/ID17: query params capturados por Signal `input()` com `withComponentInputBinding()` | atendido | app.config.ts L9 (`provideRouter(routes, withComponentInputBinding())`); a rota `saved-routes` existe sob `/profile` em app.routes.ts L51; o teste acima ativa o binding de forma explícita |
| Teste primeiro (Home e Rotas Salvas) | atendido | Os dois specs foram alterados ou criados no diff |
| Testes passam | atendido | `ng test --watch=false`: 16 arquivos passaram (16), 143 testes passaram (143) |

## Apontamentos
Nenhum.

Observações (não bloqueantes):
- O diff só toca 3 arquivos (home.component.ts e os 2 specs). Não há escopo inflado.
- O componente de Rotas Salvas não foi alterado nesta tarefa, porque os inputs e o effect já existiam. O teste novo é o que cobre o critério.
- Uma execução anterior da suíte terminou com "Worker exited with SIGTERM". Foi artefato de execuções concorrentes que eu mesmo iniciei e cancelei. A execução isolada passou limpa.
</Parecer de Conformidade — Tarefa 7>
