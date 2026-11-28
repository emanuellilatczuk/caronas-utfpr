# Decisões — Tarefa 7, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | O spec da Home continua acoplado à rota legada `saved-routes/new` (`home.component.spec.ts:443` e `:454`); a asserção não prova mais nada sobre o atalho e depende do `app.routes.ts` | código | aceito | Apontamento aceito pelo usuário na triagem da rodada 1 |
| 2 | O teste novo do SavedRoutes não prova o RED da metade "captura via inputs" (`saved-routes.component.spec.ts`, bloco novo ~853-894), pois inputs e `effect()` já existiam | código | recusado | Os inputs e o `effect()` de sincronização no `SavedRoutesComponent` já existiam de tarefas anteriores, e o teste novo verificou o binding via `RouterTestingHarness` / `withComponentInputBinding()` e o preenchimento nos campos do DOM sem duplicar o teste unitário anterior de query params reativos. Como o próprio revisor indica que o comportamento já estava implementado e não há defeito de código nem duplicação indevida, o apontamento é de rastreabilidade do processo de revisão e não exige alteração de código para concluir a tarefa. |
