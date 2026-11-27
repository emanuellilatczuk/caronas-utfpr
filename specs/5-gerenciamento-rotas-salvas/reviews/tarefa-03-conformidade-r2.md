# Parecer de Conformidade — Tarefa 3

**Veredito:** APROVADO

## Critérios verificados
| Critério | Situação | Onde |
| --- | --- | --- |
| CA1 — Busca por CEP | atendido | `cep-search-input.component.ts:31-50` — consulta o serviço e emite o endereço encontrado. |
| CA2 — Tratamento de erros e cancelamento | atendido | `cep-search-input.component.html:23-34`, `cep-search-input.component.ts:26-57` e `viacep.service.ts` — avisos inline, edição liberada, cancelamento e timeout de 3 s. |
| CA10 — ID12 (`model()`) | atendido | `cep-search-input.component.ts:15` e `days-selector.component.ts:13`; os testes exercitam sincronização nos dois sentidos. |
| CA10 — ID14 (`input()` / `output()`) | atendido | `cep-search-input.component.ts:16` e teste do host em `cep-search-input.component.spec.ts:10-17`. |
| Correção aceita na r1 — tipografia semântica | atendido | Templates usam classes semânticas; `apps/web/src/styles.css:37-40` mapeia os tamanhos Tailwind correspondentes. |

## Apontamentos
**Vazio.** Os testes focados passaram: 2 arquivos, 10 testes. O build de produção não foi executado.
