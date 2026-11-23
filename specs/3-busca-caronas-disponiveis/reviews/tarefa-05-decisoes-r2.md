# Decisões — Tarefa 5, rodada 2

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | Teste não verifica o ciclo completo real de navegação | conformidade | recusado | O teste unitário do HomeComponent comprova o disparo da navegação para `/saved-routes/new` com origem, destino, data e horário; a rota futura está configurada em `app.routes.ts` com redirecionamento temporário para `/home`. Validar resolução e redirecionamento completo com guards extrapola o escopo deste teste unitário. |
