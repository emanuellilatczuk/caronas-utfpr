# Parecer de Conformidade — Tarefa 4

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA2 — Controle ativo envia `womenOnly: true` e exclui caronas não elegíveis | atendido | `home.component.ts:74`, `ride.service.ts:85-89` |
| CA4 — Controle oculto para masculino e `other`; busca envia `false` | atendido | `home.component.ts:34`, `home.component.ts:74`, `home.component.html:194-207` |
| Service impõe exclusividade por gênero do passageiro e motorista | atendido | `ride.service.ts:85-91`, `ride.service.spec.ts:149-169` |
| Testes do componente cobrem feminino, masculino e `other` | atendido | `home.component.spec.ts:153-218` |
| Testes executados passam | atendido | 2 arquivos, 18 testes aprovados |

## Apontamentos
Nenhum.
