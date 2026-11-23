# Parecer de Código — Tarefa 5

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **Navegação aponta para uma rota inexistente** — `home.component.ts:87`, `app.routes.ts:1`
   - Regra violada: a navegação Angular deve alcançar uma rota configurada.
   - Prejuízo concreto: `/saved-routes/new` não possui rota cadastrada; a wildcard redirecionará para `/home`, tornando o atalho inoperante.

2. **Teste valida apenas a chamada interna do Router** — `home.component.spec.ts:299-318`
   - Regra violada: testes não devem acoplar-se a detalhes de implementação.
   - Prejuízo concreto: o teste não verifica a navegação real nem a existência da rota. Também não sobreviveria à troca de `navigate()` por `navigateByUrl()` sem mudança de comportamento.

## Sugestões (não bloqueiam)

- O teste poderia validar o destino real da navegação usando rotas configuradas, em vez de manter `provideRouter([])` e interceptar o método do Router.
- Caso a página de cadastro de rota ainda não exista, seria melhor ocultar o atalho até a rota ser implementada, evitando uma ação visivelmente quebrada.

## Observações fora do escopo deste diff

- Os testes solicitados passaram: 13 testes executados com sucesso. A rota foi corrigida na rodada seguinte.
