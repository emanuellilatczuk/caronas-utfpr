# Parecer de Código — Tarefa 5

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **A borda usa uma classe sem token definido** — `profile-menu.component.html:115`, `saved-routes.component.html:222,246`  
   Regra violada: design-tokens.md exige cores semânticas declaradas; `.agents/rules/01-angular-strict-rules.md` proíbe classes fora dos tokens.  
   Prejuízo concreto: `border-borda` não possui variável correspondente em `styles.css`, portanto a cor da borda não é garantida e pode não ser gerada pelo Tailwind.

## Sugestões (não bloqueiam)

- Caso os workers da suíte voltem a falhar, reduzir a concorrência do Vitest ao executar novamente os testes focados.

## Observações fora do escopo deste diff

- O build de produção passou.
- Os testes focados não iniciaram: falharam ao criar os workers do Vitest por timeout; nenhum teste chegou a ser executado.
- O diff respeita a organização under `profile` como rota pai com `children`, usa `withComponentInputBinding()`, Signals, `inject()`, Reactive Forms, controle moderno e não contém arquivos CSS por componente.
- Os dados são acessados via `SavedRouteService`; criação, edição, exclusão e consulta mantêm a responsabilidade no service.
