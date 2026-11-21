# Parecer de Conformidade — Tarefa 5

**Veredito:** APONTAMENTOS

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA3 — Exibir a mensagem e o atalho com os textos exatos | atendido | `home.component.html:256-265` |
| CA3 — Enviar origem, destino, data e horário como query params, sem criar automaticamente a rota | atendido; redirecionamento temporário aceito | `home.component.ts:85-89`; `app.routes.ts:35-38` |
| Correção aceita (1) — Registrar `/saved-routes/new` com redirecionamento temporário para `/home` | atendido | `app.routes.ts:35-38` |

## Apontamentos
1. **O teste ainda não verifica a navegação além da chamada a `Router.navigate`.** — `apps/web/src/app/features/home/pages/home/home.component.spec.ts:301-314`
   Critério violado: apontamento aceito da rodada 1 (2), “Fortalecer o teste da navegação além da chamada interna ao Router”.
   Evidência: o teste clica no atalho, mas substitui `router.navigate` por um spy com retorno simulado e verifica apenas os argumentos da chamada. Assim, não comprova o resultado da navegação.

O teste direcionado reportou **13 testes aprovados**.
