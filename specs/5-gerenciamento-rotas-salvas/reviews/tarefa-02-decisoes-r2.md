# Decisões — Tarefa 2, rodada 2

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | CA10: rotas filhas de Perfil e testes de componentes fora do escopo desta tarefa | conformidade | recusado | O escopo desta tarefa é a camada de serviço (SavedRouteService - CRUD e algoritmo de match), enquanto rotas filhas (/profile), binding de rota em componentes, @defer e testes de UI pertencem as tarefas específicas de roteamento e componentes do plan.md |
| 2 | Match aceita horário circularmente e pode considerar domingo 00:30 compatível com rota domingo 23:30 | código | aceito | Apontamento aceito pelo usuário na triagem da rodada 2 |
| 3 | Normalização textual duplicada em relação ao RideService | código | recusado | O escopo desta tarefa é entregar a lógica do SavedRouteService conforme CA7 sem introduzir acoplamento ou refatoração transversal no RideService fora do necessário para consultar as caronas abertas |
