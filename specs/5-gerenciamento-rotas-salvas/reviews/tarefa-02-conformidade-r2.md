# Parecer de Conformidade — Tarefa 2

**Veredito:** APONTAMENTOS

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA3 | atendido na camada de serviço | `saved-route.service.ts:43-54,121-130`; testes em `saved-route.service.spec.ts:85-151`. A validação da lista de dias da semana aceita somente dias reconhecidos; o apontamento da r1 foi corrigido. |
| CA4 | atendido na camada de serviço | `saved-route.service.ts:34-41`; teste de listagem vazia e filtrada pelo usuário em `saved-route.service.spec.ts:66-77`. |
| CA5 | atendido na camada de serviço | Busca da rota do usuário antes de atualizar e envio de `PATCH` em `saved-route.service.ts:57-63`; teste em `saved-route.service.spec.ts:153-167`. |
| CA6 | atendido na camada de serviço | Verificação de propriedade e `DELETE` em `saved-route.service.ts:66-68`; teste em `saved-route.service.spec.ts:170-183`. |
| CA7 | atendido | Normalização, dia, janela de horário, status, assentos e gênero em `saved-route.service.ts:71-99,134-151`; cobertura em `saved-route.service.spec.ts:186-253`. |
| CA10 | não atendido | `app.routes.ts:35-39` ainda redireciona `saved-routes/new` para `/home` e não define a estrutura `/profile` com rotas filhas. A suíte entregue testa somente o serviço (`saved-route.service.spec.ts:1-257`), sem a cobertura dos requisitos arquiteturais de componentes descritos na spec. |

**Testes:** o comando solicitado foi executado; 1 arquivo e 10 testes passaram.

## Apontamentos

1. **CA10 não está integralmente implementado nem coberto.** — `apps/web/src/app/app.routes.ts:35-39`; `apps/web/src/app/core/services/saved-route.service.spec.ts:1-257`  
   Critério violado: CA10 exige, entre outros itens, estrutura de rotas filhas sob `/profile`, controle de fluxo e views deferidas com testes, além de comunicação reativa por componentes.  
   Evidência: a rota existente `saved-routes/new` redireciona para `/home`; a suíte adicionada cobre exclusivamente `SavedRouteService`, não os requisitos de componentes e roteamento do CA10.

## Sugestões

- Tratar os requisitos arquiteturais e seus testes de componente na tarefa de interface/roteamento da funcionalidade; eles não são cobertos pela suíte do serviço.
- Manter a validação de dias como está: ela agora rejeita valores fora da semana e o teste verifica que não há persistência.
