# Parecer de Conformidade — Tarefa 1

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — normalização de origem/destino com maiúsculas, acentos, `trim()`, espaços extras e correspondência parcial | atendido | `apps/web/src/app/core/services/ride.service.ts:96-103`, `ride.service.spec.ts:96-113` |
| CA1 — data exata e horário igual ou posterior | atendido | `ride.service.ts:75-76`, `ride.service.spec.ts:115-124` |
| CA1 — exclui partidas passadas, status não aberto e caronas sem vaga | atendido | `ride.service.ts:73-78`, `ride.service.spec.ts:126-146` |
| CA1 — fornece motorista, avaliação, veículo e vagas existentes | atendido | `ride.model.ts:10-43`, `ride.service.ts:26-62`, `ride.service.spec.ts:171-180` |
| CA4 — omite `women_only` para passageiros `male` e `other` | atendido | `ride.service.ts:91`, `ride.service.spec.ts:148-155` |
| CA4 — filtro ativo aceita somente carro/ motorista feminino quando aplicável | atendido | `ride.service.ts:85-88`, `ride.service.spec.ts:157-169` |
| Arquivos previstos pela Tarefa 1 | atendido | Modelo, Service, teste e `apps/api/db.json` foram alterados exatamente nesses arquivos |
| Configuração de API via `environment.apiUrl`, sem URL fixa no Service/teste | atendido | `ride.service.ts:19,24-27`; `ride.service.spec.ts:73-76` |
| Dados MVP de veículos e avaliações | atendido | `apps/api/db.json:64-101` |
| Testes da Tarefa 1 | atendido | Comando executado: 1 arquivo aprovado e 6 testes aprovados |

## Apontamentos

Nenhum.
