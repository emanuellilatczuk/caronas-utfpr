# Parecer de Código — Tarefa 2

**Veredito:** APONTAMENTOS

Testes executados: **1 arquivo, 10 testes aprovados**.

## Apontamentos (bloqueiam)

1. **A tolerância circular de horário pode sugerir uma carona no dia errado em relação ao horário salvo** — `saved-route.service.ts:143-150`; teste `saved-route.service.spec.ts:212-223`  
   Regra violada: CA7 exige que o dia da partida coincida com um dia salvo e que o horário esteja dentro de ±1h.  
   Prejuízo concreto: uma rota marcada para domingo às 23:30 aceita uma carona de domingo às 00:30. Esses horários estão separados por 23 horas no mesmo domingo; a tolerância não deve transformar a madrugada do domingo em compatibilidade com o fim daquele dia. O teste atual consolida esse resultado.

2. **A normalização textual está duplicada** — `saved-route.service.ts:155-163`; `ride.service.ts:96-104`  
   Regra violada: evitar duplicação de regra existente; arquitetura, seções 2.1 e 3.2, concentra acesso e lógica de dados nos Services de `core/`.  
   Prejuízo concreto: a mesma regra de normalização usada para correspondência textual da US04 pode divergir da busca de rotas salvas em futuras alterações, produzindo critérios incompatíveis entre os fluxos.

## Sugestões (não bloqueiam)

- A correção da validação de dias da semana está presente: `validate` rejeita lista vazia e exige que cada dia pertença à lista aceita, antes do POST (`saved-route.service.ts:121-130`). Os testes cobrem dias inválidos sem persistência e passaram.
- Considerar os DTOs já declarados em `saved-route.model.ts:13-14` em vez de manter tipos locais equivalentes no service.
- Alinhar a interpretação de `women_only` com o `RideService`: a busca deste também exige motorista mulher quando `criteria.womenOnly` está ativo; a Tarefa 2 verifica apenas o gênero da pessoa usuária. A CA7 especifica a restrição da pessoa usuária, então vale confirmar se a diferença é intencional.

## Observações fora do escopo deste diff

- Nenhuma.
