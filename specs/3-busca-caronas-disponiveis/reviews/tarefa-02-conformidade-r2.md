# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| Valores compostos apenas por espaços são inválidos | atendido | `home.component.ts:12-20,31-32`; `home.component.spec.ts:34-42` |
| Erros não aparecem antes da interação | atendido | `home.component.html:70-91,98-122,139-177` |
| `aria-describedby` e `aria-invalid` aparecem após interação inválida | atendido | `home.component.html:68-78,96-106,124-134,152-162`; `home.component.spec.ts:84-116` |
| Tocado/perdeu foco mostra erro claro em português | atendido | `home.component.spec.ts:48-82` |
| Botão permanece desabilitado com formulário inválido | atendido | `home.component.html:181-184`; `home.component.spec.ts:71-82` |
| Sem expansão de escopo | atendido | Alterações concentradas em formulário, template e testes da Tarefa 2 |
| Testes específicos executados | atendido | 6 testes aprovados |

## Apontamentos
Nenhum.

**Testes executados:** `npm run test -w apps/web -- --watch=false --include='src/app/features/home/pages/home/home.component.spec.ts'` — 1 arquivo, 6 testes aprovados.
