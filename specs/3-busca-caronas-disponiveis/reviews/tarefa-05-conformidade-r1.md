# Parecer de Conformidade — Tarefa 5

**Veredito:** APONTAMENTOS

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| Mensagem vazia exata | atendido | `home.component.html:253-257` |
| Atalho exato apresentado | atendido | `home.component.html:258-265` |
| Navegação com origem, destino, data e horário | não atendido no conjunto | `home.component.ts:85-90`; `app.routes.ts:35-36` |
| Sem criação automática da rota | atendido | `home.component.ts:85-90`; `home.component.spec.ts:283-318` |
| Testes da tarefa | atendido | 13 testes passaram; 1 arquivo aprovado |

## Apontamentos
1. **A rota `/saved-routes/new` não está registrada.** — `apps/web/src/app/app.routes.ts:35-36`
   Critério violado: CA3 exige navegar para o cadastro já preenchido em `/saved-routes/new`.
   Evidência: o componente chama `/saved-routes/new`, mas o `app.routes.ts` não possui essa rota e utiliza o curinga `redirectTo: 'home'`. Nenhuma implementação de cadastro de Rotas Salvas foi encontrada. Além disso, o teste apenas intercepta `Router.navigate` e não valida a navegação real nem o preenchimento da tela de destino.
