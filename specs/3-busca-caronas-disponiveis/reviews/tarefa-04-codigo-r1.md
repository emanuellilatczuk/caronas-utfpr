# Parecer de Código — Tarefa 4

**Veredito:** APROVADO

## Sugestões (não bloqueiam)
- Quando o gênero deixar de ser feminino, considerar resetar `searchForm.controls.womenOnly` para `false`. Isso evita que um usuário alternando dinamicamente para masculino/`other` volte a visualizar o checkbox marcado ao retornar ao perfil feminino.
- Fortalecer o teste masculino/`other` conferindo o estado interno do controle (`womenOnly.value === false`, além do parâmetro enviado ao Service), já que hoje o código apenas força o valor na chamada.

## Evidências
- `computed` para visibilidade por gênero feminino.
- Checkbox reativo com `womenOnly`.
- Proteção na composição dos critérios da busca.
- Reforço da elegibilidade no `RideService`.
- Testes específicos: 2 arquivos, 18 testes aprovados.
