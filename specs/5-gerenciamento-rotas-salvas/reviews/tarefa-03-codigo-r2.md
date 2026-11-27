# Parecer de Código — Tarefa 3

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **Espaçamento fora da escala documentada** — `cep-search-input.component.html:12`
   `py-2.5` equivale a 10 px, valor que não consta na escala de espaçamento de `docs/design-tokens.md:40-44`. A regra Angular exige usar apenas os tokens documentados (`.agents/rules/01-angular-strict-rules.md:20`); isso deixa este componente fora do padrão visual acordado.

2. **Tipografia sem aplicar integralmente os tokens** — `cep-search-input.component.html:19`
   O botão aplica `text-button-primary`, mas não `font-button-primary`; assim, não usa a família Outfit definida para esse token. Também há divergências nos demais elementos: rótulos usam `font-bold` (700), enquanto `label` documenta SemiBold (600); o campo de texto não aplica o peso Medium (500) de `body`, e o alerta usa Medium (500) em vez de Regular (400) de `caption` (`cep-search-input.component.html:2,12,32`; `days-selector.component.html:2`; `docs/design-tokens.md:57-60`). Os tamanhos adicionados em `styles.css:37-40` correspondem aos documentados, mas isso não garante a tipografia completa. A diferença de família e pesos produz uma apresentação divergente dos tokens do projeto.

## Sugestões (não bloqueiam)

- Ampliar os testes visuais para verificar família e peso tipográficos aplicados, além da presença das classes de tamanho.

## Observações fora do escopo deste diff

- Nenhuma.

**Validação:** testes focados passaram (10/10) e o build foi concluído com sucesso. Os componentes estão tipados, sem `any`, e usam `model()`, Signals e controles com nomes/estados acessíveis.
