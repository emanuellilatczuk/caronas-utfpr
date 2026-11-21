# Parecer de Conformidade — Tarefa 02

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — Criação de conta e inicialização de sessão autenticada com token e persistência | atendido | apps/web/src/app/core/services/auth.service.ts:25-72 |
| CA2 — Login com credenciais válidas e inicialização da sessão no AuthService | atendido | apps/web/src/app/core/services/auth.service.ts:79-116 |
| CA3 — Detecção e bloqueio de e-mail duplicado exibindo "Este e-mail já está em uso" | atendido | apps/web/src/app/core/services/auth.service.ts:37-39 |
| CA6 — Mensagem de login opaca "E-mail ou senha inválidos" para senha errada ou e-mail inexistente (RN03) | atendido | apps/web/src/app/core/services/auth.service.ts:94-96 |
| CA9 — Tratamento de servidor offline/erro 5xx emitindo alerta "Servidor indisponível. Verifique se a API está em execução" | atendido | apps/web/src/app/core/services/auth.service.ts:153-157 |

## Apontamentos
*(Nenhum apontamento. Os 10 testes unitários comprovam o cumprimento integral dos critérios de negócio e fluxos alternativos da spec).*
