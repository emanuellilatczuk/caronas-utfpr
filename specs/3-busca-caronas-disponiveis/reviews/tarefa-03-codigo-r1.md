# Parecer de Código — Tarefa 3

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **“Modo Elas por Elas” não existe na implementação da busca** — `home.component.ts:72`
   - Regra violada: `spec.md`, CA2.
   - `womenOnly` é sempre enviado como `false`, sem controle na tela ou estado reativo. Passageiras não conseguem ativar o filtro.

2. **Estado vazio não atende ao CA3** — `home.component.html:238-242`
   - Regra violada: `spec.md`, CA3.
   - A mensagem não é a exigida e não oferece o atalho “Cadastrar trajeto em Rotas Salvas” com navegação preenchida por origem, destino, data e horário.

3. **Validade de data e horário não é aplicada pelo formulário** — `home.component.ts:39-42`, `home.component.html:103-143`
   - Regra violada: `spec.md`, CA5.
   - Só `Validators.required` é usado. Datas anteriores e combinações de data/horário já passadas podem manter o formulário válido e habilitar a busca, em vez de serem destacadas como inválidas.

## Sugestões (não bloqueiam)

- Evitar que buscas concorrentes sobrescrevam resultados mais recentes; existe risco de resposta assíncrona antiga substituir uma pesquisa nova.
- O texto vazio pode explicitar diretamente rota/data, como exige o CA3.
- Desabilitar o botão durante `searchState === 'loading'` também pode melhorar a prevenção de envios duplicados.

## Observações fora do escopo deste diff

- Os padrões Angular estritos foram respeitados no trecho revisado: `inject()`, Signals, `@if`, `@for` com `track`, componentes standalone e tipagem sem `any`.
- O componente não chama `HttpClient` diretamente.
- Testes solicitados passaram: 1 arquivo, 8 testes.
