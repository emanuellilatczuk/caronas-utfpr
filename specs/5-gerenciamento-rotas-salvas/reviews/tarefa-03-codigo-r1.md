# Parecer de Código — Tarefa 3

**Veredito:** APONTAMENTOS

**Validação:** os testes solicitados passaram — 2 arquivos, 9 testes.

## Apontamentos (bloqueiam)
1. **Tamanhos tipográficos usam a escala padrão do Tailwind, não tokens semânticos** — `cep-search-input.component.html:2,12,19,26,32`; `days-selector.component.html:2,9`  
   Regra violada: `.agents/rules/01-angular-strict-rules.md`, regra 2, exige fonte somente pelos tokens de `docs/design-tokens.md`; a arquitetura também define estilos tipográficos semânticos. `text-xs` e `text-sm` são tamanhos genéricos, não tokens como `caption`, `label` ou `body`.  
   Prejuízo concreto: esses componentes podem divergir da tipografia definida para o produto e contornam a regra visual obrigatória. Use estilos tipográficos mapeados aos tokens semânticos.

## Sugestões (não bloqueiam)
- Desabilitar o botão durante a busca e sinalizar visualmente o carregamento. Hoje ele continua acionável, permitindo buscas repetidas; isso também não segue o estado de carregamento descrito em `docs/design-tokens.md`.
- Restringir os valores dos dias a um tipo união dos sete dias, em vez de `string`, para detectar valores inválidos em compilação.

## Observações fora do escopo deste diff
- Os componentes usam `model()` e `output()` tipados, `inject()` e Signals; a busca externa passa pelo `ViaCepService`. O controle de fluxo e os atributos de acessibilidade observados estão adequados.
