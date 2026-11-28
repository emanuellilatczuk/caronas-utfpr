# Parecer de Conformidade — Tarefa 4

**Veredito:** APONTAMENTOS

## Critérios verificados
| Critério | Situação | Onde |
| --- | --- | --- |
| CA1/CA2 — Busca por CEP integrada aos campos editáveis e tratamento de erros | atendido no código | `saved-routes.component.html:48-70`; `saved-routes.component.ts:94`; `viacep.service.ts:69-113` |
| CA3 — Campos obrigatórios, botão desabilitado, toggle feminino e envio | atendido no escopo do formulário | `saved-routes.component.ts:40-57, 108-121`; `saved-routes.component.html:34-138` |
| CA10 — ID13 (`effect()`) e ID14 (`input()`/`output()`) | atendido | `saved-routes.component.ts:33-37, 58-87, 121`; `saved-routes.component.html:48-86` |
| CA10 — ID6 (`@if` e `@switch` para estados/erros, com testes) | não atendido | `saved-routes.component.html:34-140`; `saved-routes.component.spec.ts:69-86` |

## Apontamentos
1. **ID6 não cumpre o uso obrigatório de `@switch`, e os testes não verificam os erros inline renderizados** — `saved-routes.component.html:34-140`; `saved-routes.component.spec.ts:69-86`  
   Critério violado: CA10, ID6 exige `@if` e `@switch` para estados e erros inline, validados por testes unitários.  
   Evidência: o template usa `@if` para os erros, sem `@switch`; o teste verifica erros nos controles e o botão desabilitado, mas não marca os campos como tocados nem verifica as mensagens no DOM.  
   **Sugestão:** incluir o controle de fluxo exigido e testar a renderização das mensagens inline após interação.

2. **O teste de integração do CEP não comprova o caminho do subcomponente até o campo** — `saved-routes.component.spec.ts:109-117`  
   Critério violado: plano da Tarefa 4, que prevê testar a recepção do endereço via busca por CEP.  
   Evidência: o teste chama `applyAddress()` diretamente e verifica apenas Origem; não aciona a busca nem verifica o evento do componente ou o preenchimento de Destino.  
   **Sugestão:** testar a busca e o evento nos campos de Origem e Destino.

3. **A execução do teste exato falhou, sem executar testes** — `saved-routes.component.spec.ts`  
   Critério violado: método de revisão da tarefa, que exige executar os testes; teste que não roda não conta como critério atendido.  
   Evidência: o comando solicitado terminou com código 1; após o build, Vitest reportou `Failed to start forks worker` e `Timeout waiting for worker to respond`; resultado: **0 arquivos e 0 testes**.  
   **Sugestão:** resolver a falha de inicialização do worker e repetir o comando para obter resultado dos testes.
