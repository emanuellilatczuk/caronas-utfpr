# Parecer de Código — Tarefa 1

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **O estado reativo ainda não distingue timeout de falha de rede** — `apps/web/src/app/core/models/saved-route.model.ts:39-43`; `apps/web/src/app/core/services/viacep.service.ts:58, 78-87, 115-127`
   Regra violada: o apontamento aceito da rodada 1 pede preservar o motivo do erro para diferenciar CEP inválido, inexistente, timeout e falha de rede. A arquitetura prevê o bridge assíncrono↔reativo via `toSignal()`/`toObservable()` (`docs/architecture.md:74`).
   Prejuízo concreto: `ViaCepErrorKind` só contempla `invalid-cep`, `not-found` e `network-error`. O `catchError` converte timeout e falha de rede na mesma mensagem, e `toErrorState()` os classifica igualmente. Consumidores de `currentAddress` não conseguem diferenciá-los, então o apontamento aceito permanece parcialmente sem correção.

## Sugestões (não bloqueiam)

- A classificação por comparação de mensagens (`viacep.service.ts:120-127`) é frágil: mudanças no texto podem alterar a classificação do erro.

## Observações fora do escopo deste diff

- Os testes indicados passaram: **10 testes** em `viacep.service.spec.ts`.

**APONTAMENTOS**
