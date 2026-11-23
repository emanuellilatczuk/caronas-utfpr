# Parecer de Conformidade — Tarefa 6

**Veredito:** APONTAMENTOS

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — Dados dos resultados preservados | atendido | `home.component.html:245-293` |
| CA2 — Filtro Elas por Elas preservado | atendido | `home.component.html:185-198`; `home.component.ts:15` |
| CA3 — Texto, atalho e queryParams sem persistência automática | atendido | `home.component.html:226-239`; `home.component.ts:85-89`; `home.component.spec.ts:439-461` |
| CA5 — Validações, erros após interação e botão desabilitado | atendido | `home.component.html:54-182,204`; `home.component.ts:51-54` |
| Layout responsivo, tokens e referência/acessibilidade do logo | atendido | `home.component.html:2-15,34-48`; `home.component.spec.ts:100-153` |
| Seletores, acessibilidade e estados de busca preservados | atendido | `home.component.html:60-292`; `home.component.spec.ts:227-286,380-423` |
| Teste unitário requerido para validar a Tarefa 6 | não atendido | `plan.md:42`; `home.component.spec.ts` |

## Apontamentos
1. **A validação automatizada da Tarefa 6 ficou bloqueada: nenhum teste foi executado.** — `plan.md:42`; `apps/web/src/app/features/home/pages/home/home.component.spec.ts`  
   Critério violado: plano da Tarefa 6, linha 42, que requer testes unitários para garantir layout, tokens, logo e preservação dos comportamentos.  
   Evidência: o comando solicitado foi executado duas vezes; em ambas, o Vitest falhou ao iniciar o worker (`Timeout waiting for worker to respond`) e reportou `Test Files no tests` e `Tests no tests`.

## Sugestões não-bloqueantes
Nenhuma.
