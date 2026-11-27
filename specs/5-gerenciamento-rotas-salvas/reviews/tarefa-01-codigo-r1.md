# Parecer de Código — Tarefa 1

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **O bridge reativo perde a natureza do erro e impede avisos inline distintos** — `apps/web/src/app/core/services/viacep.service.ts:13-23`
   - **Regra violada:** CA2 exige avisos específicos para CEP inválido, inexistente e indisponibilidade. O `catchError(() => of(null))` transforma todas as falhas em `null`, sem preservar ou expor o motivo.
   - **Prejuízo concreto:** Consumidores de `currentAddress` não conseguem distinguir timeout, erro de rede e CEP inexistente para apresentar a mensagem correta exigida pela spec.
   - Evidência complementar: `setSearchCep()` dispara esse fluxo em `viacep.service.ts:29-31`, enquanto `getAddressByCep()` produz os erros adequados apenas no Observable direto em `viacep.service.ts:39-70`.

## Sugestões (não bloqueiam)

- Adicionar estados reativos tipados de erro/carregamento, por exemplo `searchError` e `isLoading`, e testar o fluxo reativo para erro de rede, CEP inexistente e timeout.
- O teste “higienizar CEP contendo hífen e caracteres especiais” em `viacep.service.spec.ts:38` não cobre caracteres especiais além do hífen; alterar o título ou acrescentar casos separados.
- Cobrir o cancelamento reativo quando `setSearchCep('')` é acionado durante uma resposta pendente, garantindo que ela não sobrescreva entradas manuais.

## Validação executada

- Testes: **8/8 passaram** com o comando fornecido.
- Arquitetura: o `SavedRoute` está em `core/models/saved-route.model.ts:1-14`, e o ViaCEP está encapsulado em `core/services/viacep.service.ts:1-104`, respeitando a camada de Service.
- Foi utilizada `inject()` em `viacep.service.ts:9-10`, `toObservable()`/`toSignal()` em `viacep.service.ts:12-24` e timeout de 3 segundos em `viacep.service.ts:49-50`.
- A coleção `saved_routes` vazia foi adicionada a `apps/api/db.json:104`.
