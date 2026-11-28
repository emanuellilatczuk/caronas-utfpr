<Parecer de Código — Tarefa 7 (rodada 1)>
**Veredito:** APONTAMENTOS (REPROVADO)

Nota: `ng test --watch=false` ainda estava rodando (sem saída no log) quando fechei este parecer. Não afirmo que os testes passam. O parecer é só de leitura do diff, que tem 3 arquivos: home.component.ts, home.component.spec.ts e saved-routes.component.spec.ts.

## Apontamentos (bloqueiam)
1. **O spec da Home continua acoplado à rota legada `saved-routes/new`.** — `apps/web/src/app/features/home/pages/home/home.component.spec.ts:443` e `:454`
   - O teste procura em `router.config` a rota `saved-routes/new` e exige `redirectTo === '/home'`. A Tarefa 7 tirou esse destino do atalho (`home.component.ts:86-88` agora navega para `/profile/saved-routes`), então essa asserção não prova mais nada sobre o atalho.
   - Regra violada: "teste acoplado a detalhe de implementação, que quebra em qualquer refatoração".
   - Prejuízo concreto: o teste de navegação da Home passa a depender da tabela de rotas do `app.routes.ts`. Se alguém remover o redirect morto (veja a observação 1 abaixo), o teste da Home quebra sem relação com o comportamento testado.
   - Correção esperada: remover as linhas 443 e 454 e deixar só o texto do botão e o `navigateSpy`.

2. **O teste novo do SavedRoutes só cobre a entrada dos query params no campo.** — `saved-routes.component.spec.ts` (bloco novo, ~linhas 853-894)
   - Regra violada: o texto literal da Tarefa 7 pede "captura desses queryParams via Signal inputs". Os signals `origin`, `destination` e `time` já existem em `saved-routes.component.ts:70-72`, e o `effect` das linhas 120-133 faz o preenchimento. Esse código foi entregue em tarefa anterior. O diff não toca nele.
   - Prejuízo concreto: o teste novo pode ter passado de primeira. Ele não prova o RED da Tarefa 7, então não dá para dizer que o TDD foi seguido nessa metade. Isso é questão de rastreabilidade, não de defeito no código.
   - Peça ao implementador evidência do RED, ou assuma que essa metade já estava coberta e aponte o teste anterior que a cobre.
   - Se esse teste duplica um existente (procure por `withComponentInputBinding`/`origin` no spec), a duplicação é o prejuízo.

## Sugestões (não bloqueiam)
- O teste usa `RouterTestingHarness` com rota real e `withComponentInputBinding()`. Isso é bom: exercita a integração de verdade, em vez de setar o input por `setInput`. Ele repete o bloco de providers dos outros describes do mesmo arquivo. Vale extrair um helper de configuração do TestBed. É preferência, não bloqueia.
- Falta cobrir `destination`/`time` ausentes (só `origin`), para provar que os campos não são sobrescritos com vazio. O `effect` já trata `undefined`, mas nenhum teste exercita isso.
- Também falta um teste para query params que chegam depois do primeiro render. O `effect` sobrescreve a digitação do usuário se o signal mudar. Hoje isso é teórico, porque a navegação vem da Home.
- O `date` saiu do payload do atalho. Isso está correto, pois Rotas Salvas não tem campo de data (`saved_routes` tem `preferred_time` e `days_of_week`). Confirme que o spec.md CA9/CA10 não pede `date`.

## Observações fora do escopo deste diff
1. **Rota morta.** `app.routes.ts:67-71` ainda tem `saved-routes/new → /home`, e nada na aplicação navega mais para ela. Candidata a Issue de manutenção.
2. **Mapa de rotas desatualizado.** `docs/architecture.md` §6 lista `/saved-routes` como rota de rotas salvas. A implementação real é `/profile/saved-routes`, aninhada em `/profile`. Atualize o doc.
3. **Diretriz de `effect`.** O `effect` que escreve em `FormControl` (`saved-routes.component.ts:120-133`) é aceitável, porque o architecture.md autoriza `effect()` para efeitos colaterais. Ele fica frágil se for reexecutado: ele sobrescreve a edição do usuário a cada mudança de input.
</Parecer de Código — Tarefa 7 (rodada 1)>
