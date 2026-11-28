# Parecer de Conformidade — Tarefa 4

**Veredito:** APROVADO

## Critérios verificados
| Critério | Situação | Onde |
| --- | --- | --- |
| CA1/CA2 — Busca por CEP nos campos de origem e destino, mantendo o endereço editável e tratando erros | atendido | `saved-routes.component.html:49-84`; teste do fluxo pelos dois campos em `saved-routes.component.spec.ts:118-142`; tratamento no `viacep.service.ts:69-122` |
| CA3 — Validações, botão desabilitado, modo feminino e submissão | atendido no escopo do formulário | `saved-routes.component.ts:16-57, 112-136`; testes em `saved-routes.component.spec.ts:78-116, 329-352` |
| CA10 — ID6, controle de fluxo do formulário | atendido | `saved-routes.component.html:10-18, 35-39, 151-168` |
| CA10 — ID13/ID14, reatividade e comunicação tipada | atendido | `saved-routes.component.ts:33-37, 54-100, 144-172`; teste reativo em `saved-routes.component.spec.ts:144-175` |
| Itens aceitos na rodada 1: proteção contra resposta de ID obsoleto e erros acessíveis | atendido | `saved-routes.component.ts:83, 144-172`; testes em `saved-routes.component.spec.ts:177-257, 259-289` |
| Itens aceitos na rodada 1: busca CEP integrada em origem/destino, carregamento visual e remoção de `routeForm` | atendido | `saved-routes.component.spec.ts:118-142, 291-327`; `saved-routes.component.html:153-168` |
| Teste solicitado | atendido | Na segunda execução: **11 testes passaram**. A primeira execução terminou com timeout ao iniciar o worker. |

## Apontamentos

