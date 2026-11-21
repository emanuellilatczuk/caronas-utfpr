# Parecer de Codigo - Tarefa 1

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **URL da API local fixada no service** - `apps/web/src/app/core/services/ride.service.ts:12`
   Regra violada: `docs/architecture.md:296-299` define que a URL da API fica em `environment.development.ts`; a secao 2.1 tambem prevê a substituicao da fonte de dados entre entregas.
   Prejuizo concreto: ao mudar a URL ou a fonte de dados, este service continuara apontando para `localhost:3000`, podendo quebrar buscas em outros ambientes.
   Sugestao: obter a URL da configuracao de ambiente, conforme a arquitetura.

## Sugestoes (não bloqueiam)

- Nenhuma adicional.

## Observacoes fora do escopo deste diff

- `AuthService` ja contem uma URL local fixa (`apps/web/src/app/core/services/auth.service.ts:11`); vale considerar essa configuracao ao consolidar a correcao.

Os testes solicitados passaram: **5 testes**.
