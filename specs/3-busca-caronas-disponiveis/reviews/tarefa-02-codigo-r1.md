# Parecer de Código — Tarefa 2

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)
1. **Origem e destino aceitam valores compostos apenas por espaços** — `home.component.ts:17-20`
   Regra violada: `spec.md` CA1/CA5 exige entradas válidas e normalização com `trim()`.
   Prejuízo concreto: `"   "` torna o formulário válido e habilita a busca com origem ou destino vazios após normalização.

2. **Mensagens de erro não são associadas aos inputs** — `home.component.html:61-136`
   Regra violada: acessibilidade básica solicitada na revisão.
   Prejuízo concreto: leitores de tela não anunciam nem relacionam claramente o erro ao campo inválido. É necessário `aria-describedby` e `aria-invalid`.

## Sugestões (não bloqueiam)
- Adicionar testes para entradas válidas e para origem/destino contendo apenas espaços.
- Não há problemas encontrados com `inject()`, `NonNullableFormBuilder`, `ReactiveFormsModule`, control flow moderno, Signals, tipagem, isolamento de dados ou uso de componentes standalone.

Os 4 testes solicitados passaram.
