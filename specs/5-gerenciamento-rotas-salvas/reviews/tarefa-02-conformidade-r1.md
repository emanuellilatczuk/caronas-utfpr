# Parecer de Conformidade — Tarefa 2

**Veredito:** APONTAMENTOS

## Critérios verificados
| Critério | Situação | Onde |
| --- | --- | --- |
| CA3 — Cadastro e validação | não atendido | `saved-route.service.ts:121-130` |
| CA4 — Listagem de rotas | atendido no serviço; apresentação da lista fica fora desta tarefa | `saved-route.service.ts:34-40`; teste `saved-route.service.spec.ts:66-75` |
| CA5 — Edição | atendido no serviço; navegação e captura do `:id` ficam fora desta tarefa | `saved-route.service.ts:57-63`; teste `saved-route.service.spec.ts:110-125` |
| CA6 — Exclusão | atendido no serviço; confirmação e cancelamento ficam fora desta tarefa | `saved-route.service.ts:66-68`; teste `saved-route.service.spec.ts:127-140` |
| CA7 — Match de caronas | atendido | `saved-route.service.ts:71-100, 133-150`; teste `saved-route.service.spec.ts:143-205` |
| CA10 — Conformidade arquitetural | fora desta tarefa, exceto testes do serviço; **8 testes passaram** | `saved-route.service.spec.ts`; execução do comando solicitado |

## Apontamentos
1. **A validação aceita dias da semana que não são válidos** — `saved-route.service.ts:121-130`  
   Critério violado: CA3, `spec.md:22`, que limita a seleção aos dias da semana de segunda a domingo.  
   Evidência: `validate` só rejeita `days_of_week` vazio (`length === 0`); por exemplo, `['qualquer']` passa e a rota segue para o POST (`saved-route.service.ts:43-55`). O teste de rota inválida cobre somente nome em branco e lista vazia (`saved-route.service.spec.ts:97-108`).

## Sugestões não bloqueantes
- Acrescentar testes que comprovem que editar/excluir uma rota de outro usuário é rejeitado. A implementação faz a busca filtrada pelo usuário antes dessas operações (`saved-route.service.ts:104-112`), mas os testes atuais cobrem apenas rotas pertencentes ao usuário autenticado.
