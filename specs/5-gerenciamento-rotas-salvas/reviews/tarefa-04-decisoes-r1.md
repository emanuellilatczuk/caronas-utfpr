# Decisões — Tarefa 4, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | ID6/CA10 exige `@switch` e testes das mensagens inline | conformidade | recusado | conforme o spec.md (CA10) e o plan.md, o uso do @switch é destinado a alternância entre as abas "Minhas Rotas" e "Sugestões de Match", que fazem parte do escopo das Tarefas 5 e 6, e não do formulário isolado da tarefa 4 |
| 2 | Respostas assíncronas antigas podem sobrescrever formulário após troca de `id` | código | aceito | Apontamento aceito pelo usuário na triagem da rodada 1 |
| 3 | Erros não estão associados aos campos com `aria-invalid`/`aria-describedby` | código | aceito | Apontamento aceito pelo usuário na triagem da rodada 1 |
| 4 | Testar evento de CEP de ponta a ponta nos campos de Origem e Destino | conformidade (sugestão promovida) | aceito | Sugestão promovida pelo usuário a correção obrigatória na triagem da rodada 1 |
| 5 | Alinhar estado de carregamento/hover do botão aos tokens | código (sugestão promovida) | aceito | Sugestão promovida pelo usuário a correção obrigatória na triagem da rodada 1 |
| 6 | Remover alias `routeForm` sem uso | código (sugestão promovida) | aceito | Sugestão promovida pelo usuário a correção obrigatória na triagem da rodada 1 |

## Observação de validação

Um revisor registrou falha inicial de worker (0 testes); o outro reportou que a repetição passou com 6 testes. O usuário decidiu manter a falha inicial como observação, já que a repetição passou.
