# Parecer de Codigo - Tarefa 1

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **O teste ainda fixa localhost:3000 em vez de usar a configuracao de ambiente** - `apps/web/src/app/core/services/ride.service.spec.ts:53-54`
   Regra violada: apontamento aceito da rodada 1 exige que a API seja configurada por environment e que URLs locais nao fiquem fixadas no codigo.
   Prejuizo concreto: o teste deixara de validar corretamente o service caso a URL seja alterada por ambiente ou substituida durante a migracao para Supabase.
