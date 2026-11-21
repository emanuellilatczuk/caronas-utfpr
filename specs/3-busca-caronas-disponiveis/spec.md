---
issue: 3
status: rascunho
---

# US04 — Busca e Visualização de Caronas Disponíveis

## O problema

O Passageiro não possui uma forma demonstrável de localizar caronas abertas compatíveis com seu trajeto, data e horário, nem de verificar rapidamente vagas e credenciais básicas do Motorista antes de solicitar uma reserva.

## A história

**Como** Passageiro autenticado,
**eu quero** pesquisar caronas por origem e destino, filtrando por data, horário e pelo Modo Elas por Elas,
**para que** eu possa visualizar os trajetos disponíveis, a quantidade de vagas e as avaliações do Motorista antes de solicitar uma vaga.

## Critérios de aceite

- [ ] **CA1 — Dado** que sou um Passageiro autenticado na tela de busca, **quando** informo uma origem e um destino normalizados, seleciono uma data e informo um horário, **então** o sistema lista as caronas abertas cuja origem e destino correspondam por texto normalizado (ignorando maiúsculas e acentos), cuja data seja igual à selecionada e cuja saída seja no horário informado ou depois, exibindo foto/nome do Motorista, nota de avaliação, modelo e cor do veículo, horário de saída, ponto de encontro e total de vagas restantes.
- [ ] **CA2 — Dado** que sou uma Passageira com gênero feminino cadastrado, **quando** ativo o filtro "Modo Elas por Elas", **então** a listagem exibe exclusivamente caronas publicadas por Motoristas mulheres que habilitaram essa modalidade.
- [ ] **CA3 — Dado** que realizo uma pesquisa sem ofertas ativas para a rota/data, **quando** o sistema processa a busca, **então** exibe "Nenhuma carona encontrada para esta rota/data" e oferece o atalho "Cadastrar trajeto em Rotas Salvas" com origem, destino, data e horário da busca já preenchidos.
- [ ] **CA4 — Dado** que sou um usuário com gênero masculino cadastrado, **quando** acesso a tela de busca, **então** o filtro "Modo Elas por Elas" não é exibido e caronas com essa modalidade são omitidas dos resultados.
- [ ] **CA5 — Dado** que estou na busca, **quando** aciono a pesquisa sem informar origem, destino ou data, **então** o sistema destaca os campos necessários e impede a pesquisa até todos os critérios mínimos serem preenchidos.

## Fora de escopo

- Solicitar vaga diretamente a partir da listagem.
- Confirmar reserva, gerar PIN ou iniciar/finalizar viagem.
- Busca geográfica por raio, mapa ou pontos próximos.
- Push, e-mail ou SMS sobre resultados da busca.
- Integração com Supabase nesta entrega; os dados da busca permanecem no MVP com json-server.

## Abandono no meio

Ao fechar a página ou perder a sessão durante a busca, a consulta em andamento é encerrada sem alterar dados persistidos. Ao retornar, o usuário autenticado pode iniciar uma nova busca. Os critérios informados devem permanecer válidos apenas durante a sessão da tela; não há cadastro automático de rota salvo.

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| Os dados de usuário, perfil de gênero, Motorista, veículo, avaliação e carona já estão disponíveis no json-server por outras histórias. | Depende das histórias que fornecem esses dados. |

## Depende de

- Autenticação ativa e perfil do usuário com gênero cadastrado.
- Dados de Motoristas, veículos, avaliações e caronas abertas disponibilizados pelos Services do MVP.
- A entrega da estrutura Angular da aplicação e do padrão de navegação já existente.

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |
