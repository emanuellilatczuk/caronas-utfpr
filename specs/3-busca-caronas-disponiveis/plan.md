# Plano — Issue #3

## Decisoes tecnicas

- Implementar `RideService` em `core/services/` para consultar caronas e montar resultados sem acesso HTTP direto nos componentes.
- Representar o filtro normalizado e a elegibilidade do Modo Elas por Elas em metodos testaveis do Service.
- Manter o estado reativo da busca com Signals e o formulario com `ReactiveFormsModule`/`NonNullableFormBuilder`.
- Usar a pagina existente `home` como tela de busca, com componentes standalone e controle condicional moderno do Angular.
- Consultar os dados do MVP em `apps/api/db.json`; a interface do Service permanece substituivel por Supabase sem alterar o componente.
- No estado vazio, navegar para o cadastro de Rotas Salvas levando origem, destino, data e horario como parametros de contexto, sem persistir automaticamente.

## Tarefas

- [ ] **Tarefa 1 - Criar o modelo e o filtro de caronas**
  - Cobre: CA1 e CA4
  - Teste primeiro: testar no `RideService` normalizacao de origem/destino com maiusculas, acentos, `trim()`, espacos extras e correspondencia parcial; data exata; horario igual ou posterior; exclusao de partidas passadas e de caronas sem vaga; exclusao de caronas `women_only` para masculino e `other`.
  - Arquivos previstos: `apps/web/src/app/core/models/ride.model.ts`, `apps/web/src/app/core/services/ride.service.ts`, `apps/web/src/app/core/services/ride.service.spec.ts`, `apps/api/db.json`

- [ ] **Tarefa 2 - Implementar e validar o formulario de busca**
  - Cobre: CA5
  - Teste primeiro: testar no componente que origem, destino, data e horario sao obrigatorios; campos nao exibem erro antes da interacao; `blur` invalido mostra mensagem em portugues; formulario invalido desabilita o botao de busca.
  - Arquivos previstos: `apps/web/src/app/features/home/pages/home/home.component.ts`, `apps/web/src/app/features/home/pages/home/home.component.html`, `apps/web/src/app/features/home/pages/home/home.component.spec.ts`

- [ ] **Tarefa 3 - Montar a listagem dos resultados elegiveis**
  - Cobre: CA1
  - Teste primeiro: testar no componente que o resultado exibe foto/nome do Motorista, nota de avaliacao, modelo e cor do veiculo, horario de saida e vagas restantes; testar que uma lista vazia nao e confundida com erro.
  - Arquivos previstos: `apps/web/src/app/features/home/pages/home/home.component.ts`, `apps/web/src/app/features/home/pages/home/home.component.html`, `apps/web/src/app/features/home/pages/home/home.component.spec.ts`

- [ ] **Tarefa 4 - Implementar o filtro Modo Elas por Elas**
  - Cobre: CA2 e CA4
  - Teste primeiro: testar no componente e no Service que o filtro aparece apenas para genero feminino, ativa somente caronas exclusivas publicadas por Motoristas mulheres e fica ausente para masculino e `other`.
  - Arquivos previstos: `apps/web/src/app/features/home/pages/home/home.component.ts`, `apps/web/src/app/features/home/pages/home/home.component.html`, `apps/web/src/app/features/home/pages/home/home.component.spec.ts`, `apps/web/src/app/core/services/ride.service.ts`

- [ ] **Tarefa 5 - Implementar estado vazio e navegacao para Rotas Salvas**
  - Cobre: CA3
  - Teste primeiro: testar no componente a mensagem exata, o atalho para o cadastro de Rotas Salvas e os parametros de contexto contendo origem, destino, data e horario; confirmar que nenhum cadastro e criado pela navegacao.
  - Arquivos previstos: `apps/web/src/app/features/home/pages/home/home.component.ts`, `apps/web/src/app/features/home/pages/home/home.component.html`, `apps/web/src/app/features/home/pages/home/home.component.spec.ts`, `apps/web/src/app/app.routes.ts`

## Criterios sem tarefa
