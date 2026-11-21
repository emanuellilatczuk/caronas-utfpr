# Parecer de Código — Tarefa 1

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum apontamento bloqueante.

O diff respeita a separação em `core/models`, `core/services` e `environment.apiUrl`. O `HttpClient` está encapsulado no `RideService`, com injeção via `inject()`.

A filtragem cobre normalização textual, correspondência parcial, data exata, horário posterior, partidas vencidas, vagas e modo "Elas por Elas". Os modelos foram ampliados com veículo e avaliação média sem introduzir dependências indevidas.

## Sugestões (não bloqueiam)

- `apps/web/src/app/core/services/ride.service.ts:79-83` — tornar a normalização defensiva para valores não textuais vindos da API.
  `normalizeText(value: string)` assume que `origin` e `destination` são strings válidas em todos os registros.

- `apps/web/src/app/core/services/ride.service.ts:29-31` — considerar ignorar avaliações inválidas ou fora do intervalo previsto.
  Valores como `NaN`, `null` ou notas fora de `1–5` poderiam produzir uma média inválida apesar da tipagem TypeScript.

- `apps/web/src/app/core/services/ride.service.spec.ts:85-171` — ampliar a cobertura para partidas com data anterior à selecionada e timestamps malformados.
  Isso torna mais explícita a robustez do filtro diante de dados inconsistentes.

## Validação executada

- Diff completo da revisão conferido.
- Testes específicos executados: **6 testes aprovados**.
- Comando: `npm run test -w apps/web -- --watch=false --include=src/app/core/services/ride.service.spec.ts`
