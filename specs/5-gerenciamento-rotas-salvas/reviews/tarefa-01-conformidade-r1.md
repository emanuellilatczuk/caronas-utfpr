# Parecer de Conformidade — Tarefa 1

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — GET, validação e endereço formatado | atendido no escopo da tarefa | `viacep.service.ts:32-66`; `viacep.service.ts:89-103`; `viacep.service.spec.ts:44-68` |
| CA2 — CEP inválido, inexistente, rede e timeout de 3 s | atendido no escopo da tarefa | `viacep.service.ts:38-48`; `viacep.service.ts:50-64`; `viacep.service.spec.ts:24-42`; `viacep.service.spec.ts:70-103` |
| CA10 — ID20/ID25 | atendido | `viacep.service.ts:1-28`; `saved-route.model.ts:1-37`; `db.json:103-104` |
| Modelo `SavedRoute` e coleção persistida | atendido | `saved-route.model.ts:1-12`; `db.json:103-104` |

Os 8 testes específicos passaram com sucesso: `npm run test -w apps/web -- --watch=false --include=src/app/core/services/viacep.service.spec.ts`.

## Apontamentos

Nenhum apontamento bloqueante.

## Sugestões
- Adicionar um teste unitário específico para cancelamento reativo pela limpeza do CEP, garantindo que uma resposta atrasada não sobrescreva entradas manuais, conforme o cenário de abandono da spec.
