# Parecer de Conformidade - Tarefa 1

**Veredito:** APROVADO

## Criterios verificados

| Criterio (da spec) | Situacao | Onde |
| --- | --- | --- |
| Modelo de caronas e filtro normalizado | atendido | `ride.model.ts:1-35`; `ride.service.ts:30-62` |
| Exclusao de caronas passadas, canceladas e sem vagas | atendido | `ride.service.ts:39-62`; teste aprovado |
| Filtro "Modo Elas por Elas" | atendido | `ride.service.ts:55-62`; testes aprovados |
| Omissao de caronas exclusivas para genero masculino ou `other` | atendido | `ride.service.ts:62`; teste aprovado |
| Correcao da URL fixa | atendido | `ride.service.ts:4,13-19`; usa `environment.apiUrl`; `environment.development.ts:2` |
| Nenhuma alteração na spec | atendido | `spec.md` nao consta no diff |
| Testes da rodada | atendido | 5 testes aprovados |

## Apontamentos

Nenhum.
