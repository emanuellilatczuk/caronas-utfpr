# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| Origem, destino, data e horário obrigatórios | atendido | `home.component.ts:15-20` |
| Sem erros antes da interação | atendido | `home.component.html:70-145`; `home.component.spec.ts:43-46` |
| Blur/touched inválido mostra mensagens em português | atendido | `home.component.html:70-145`; `home.component.spec.ts:48-69` |
| Botão desabilitado enquanto inválido | atendido | `home.component.html:138-145`; `home.component.spec.ts:71-82` |
| Envio inválido impedido | atendido | `home.component.ts:22-27` |
| Apenas os três arquivos previstos foram alterados | atendido | Diff: `home.component.ts`, `.html` e `.spec.ts` |
| Sem listagem, filtro ou estado vazio fora do escopo | atendido | Não foram encontrados esses comportamentos na pasta da tarefa |

## Apontamentos
Nenhum.

Testes executados: `4` testes aprovados em `home.component.spec.ts`.
