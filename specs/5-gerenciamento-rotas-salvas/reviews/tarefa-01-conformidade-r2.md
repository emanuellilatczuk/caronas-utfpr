# Parecer de Conformidade — Tarefa 1

**Veredito:** APONTAMENTOS

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — Autopreenchimento por CEP | atendido | `saved-route.model.ts:26-37`; `viacep.service.ts:47-67` |
| CA2 — CEP inválido, inexistente e indisponibilidade | não atendido parcialmente | `saved-route.model.ts:39`; `viacep.service.ts:78-86`; `viacep.service.ts:111-129` |
| CA10 — ID20/ID25 | atendido | `viacep.service.ts:18-32`; `viacep.service.ts:3-4` |
| Modelo `SavedRoute` | atendido | `saved-route.model.ts:1-12`; `db.json:104` |
| Cobertura dos testes fornecidos | atendido — 10/10 testes passaram | `viacep.service.spec.ts` |

## Apontamentos

1. **Timeout não é preservado como tipo distinto de falha de rede** — `apps/web/src/app/core/models/saved-route.model.ts:39`
   Critério violado: ID20/ID25 e CA2 exigem distinguir CEP inválido, inexistente, timeout e falha de rede no estado reativo.
   Evidência: `ViaCepErrorKind` só permite `invalid-cep`, `not-found` e `network-error`. O `timeout(3000)` em `viacep.service.ts:58` é convertido pelo `catchError` em `Não foi possível...` em `viacep.service.ts:78-86`, e `toErrorState()` classifica indiscriminadamente qualquer outro erro como `network-error` em `viacep.service.ts:119-129`. Além disso, o teste reativo cobre inválido e rede, mas não timeout.

2. **O timeout reativo não possui teste de estado** — `apps/web/src/app/core/services/viacep.service.spec.ts:97-113`
   Critério violado: a correção do apontamento aceito deve provar a distinção do tipo/motivo no bridge reativo.
   Evidência: o teste valida apenas a rejeição direta da Observable por mensagem; não verifica `currentAddress()` após timeout nem um estado de erro próprio para timeout.
