# 📄 Product Requirements Document (PRD)

**Projeto:** PassAí  
**Versão:** 1.0.0  
**Última atualização:** 2026-09-14  

> 🤖 **Este documento é a fonte da verdade sobre o QUE o produto faz.** Regra de
> negócio que não estiver aqui não existe — nem para a equipe, nem para a IA.
> Tecnologia **não** se discute aqui: isso é assunto do `architecture.md`.

---

## 🎯 1. Visão Geral e Objetivo

**O problema:** Estudantes e servidores (professores e colaboradores) da UTFPR enfrentam inflexibilidade de horários, linhas lotadas e longas esperas no transporte público local, somados ao alto custo de combustível para deslocamentos individuais diários. Soma-se a isso a insegurança no trajeto a pé até os pontos de ônibus em horários desfavoráveis (especialmente no período noturno), gerando receio e acentuada vulnerabilidade para o público feminino.

**A solução:** Uma plataforma de caronas colaborativas que conecta motoristas e passageiros da comunidade acadêmica e externa que compartilham trajetos e horários semelhantes (ex.: Casa ↔ UTFPR). O aplicativo permite o salvamento de rotas recorrentes com sugestões de trajetos compatíveis (dispensando a busca manual diária), mantém confirmação e aceite mútuo entre as partes, e introduz camadas reforçadas de segurança, destacando-se o Modo Elas por Elas (viagens exclusivas entre mulheres) e validação de embarque presencial via código PIN.

**Como saberemos que deu certo:** Esvaziamento visível e mensurável dos pontos de ônibus nos horários críticos da noite (saída das 22h30), com a redução da aglomeração de alunas, alunos e servidoras expostos na rua à espera de linhas escassas ou atrasadas. Os usuários deixam o campus já com o deslocamento combinado antecipadamente via Rotas Salvas, realizando o embarque em pontos de encontro seguros dentro ou no entorno imediato da universidade.

---

## 📖 2. Glossário Ubíquo

> Os termos do negócio, como o cliente fala. É daqui que o `architecture.md`
> deriva os nomes das entidades.

| Termo | Significa | Não confundir com |
| :---- | :-------- | :---------------- |
| **Motorista** | Usuário autenticado que possui veículo cadastrado e disponibiliza assentos livres em um determinado trajeto. | **Passageiro** (que apenas busca e ocupa vaga) ou visitante sem veículo. |
| **Passageiro** | Usuário autenticado que busca ou solicita assento em uma carona para se deslocar. | **Motorista** (que conduz o veículo e oferta a carona). |
| **Rota Salva** | Cadastro estático da preferência habitual de deslocamento (ex.: Casa ↔ UTFPR às 22h30), utilizado para alimentar o motor de sugestões do app. | **Carona (Viagem)**: a rota salva não gera uma viagem ativa nem garante reserva; é apenas uma agenda de interesse para matches. |
| **Carona** | Instância concreta de um deslocamento em data e horário específicos, com quantidade definida de vagas oferecidas pelo Motorista e status próprio (Aberta, Em Andamento, Concluída, Cancelada). | **Rota Salva**: a carona é o evento real com hora marcada, vagas contadas e status formal de execução. |
| **Solicitação de Carona** | Intenção expressa por um Passageiro de ocupar uma vaga em uma Carona específica disponibilizada por um Motorista. | **Confirmação/Reserva Garantida**: a solicitação é um estado pendente que depende de aceite explícito para se tornar reserva efetiva. |
| **Modo Elas por Elas** | Filtro de segurança aplicável a ofertas e solicitações que restringe a visibilidade e o aceite de caronas exclusivamente a usuárias do sexo feminino (motoristas e passageiras). | **Bloqueio Permanente de Perfil**: é uma modalidade de viagem configurável, permitindo que a usuária filtre suas viagens de forma restrita quando desejar. |
| **Código PIN de Confirmação** | Código numérico temporário de 4 dígitos gerado no celular do Passageiro e informado presencialmente ao Motorista no embarque para validar e iniciar formalmente a viagem. | **Senha da Conta**: é um token temporário de uso único (OTP), exclusivo para aquela viagem específica. |
| **Ponto de Encontro** | Ponto de referência acordado no trajeto (proposto pelo motorista ou solicitado pelo passageiro na solicitação) para embarque/desembarque seguro e conveniente. | **Destino final**: é apenas uma parada intermediária de embarque combinada entre as partes. |

---

## 👤 3. Atores e Permissões

> ⚠️ A coluna **"Não pode"** vira Guard na rota e regra de acesso no BaaS
> (ex.: RLS no Supabase).

| Ator | Quem é | Pode | Não pode |
| :--- | :----- | :--- | :------- |
| **Visitante** | Usuário não autenticado que acessa a landing page ou tela de boas-vindas. | • Visualizar telas de apresentação, boas-vindas e login.<br>• Criar conta e solicitar cadastro.<br>• Consultar Termos de Uso e Política de Privacidade. | • Visualizar rotas, pontos de encontro, horários ou dados de usuários.<br>• Buscar caronas ou criar ofertas.<br>• Acessar qualquer rota interna protegida ou endpoint privado. |
| **Passageiro** | Usuário autenticado e ativo na comunidade do PassAí. | • Criar, listar, editar e excluir suas Rotas Salvas.<br>• Receber e visualizar sugestões de caronas compatíveis.<br>• Enviar solicitações de carona e negociar Pontos de Encontro.<br>• Ativar o Modo Elas por Elas (se perfil feminino elegível).<br>• Visualizar o Código PIN de Confirmação da viagem em seu app.<br>• Avaliar motoristas e relatar incidentes ou denúncias. | • Publicar ou ofertar caronas sem veículo cadastrado e válido.<br>• Visualizar contatos e endereço exato do motorista antes do aceite mútuo.<br>• Acessar ou interagir com caronas do Modo Elas por Elas se não for do sexo feminino.<br>• Alterar o status da viagem no app para "Em Andamento" ou "Finalizada". |
| **Motorista** | Usuário autenticado com veículo cadastrado (mantém também todas as permissões de passageiro). | • Todas as ações permitidas ao Passageiro.<br>• Cadastrar, listar, editar e remover seus veículos.<br>• Publicar ofertas de carona (avulsas ou vinculadas às Rotas Salvas).<br>• Aceitar ou recusar solicitações de reserva feitas por passageiros.<br>• Inserir o PIN do passageiro no embarque para iniciar a viagem.<br>• Finalizar a carona e avaliar os passageiros ao término. | • Publicar caronas sem selecionar veículo válido.<br>• Alterar rota principal ou horário após ter reservas aceitas e confirmadas.<br>• Iniciar a viagem no aplicativo sem validar o PIN de 4 dígitos do passageiro.<br>• Visualizar perfis e caronas do Modo Elas por Elas se for do sexo masculino. |
| **Administrador** | Gestor da plataforma, suporte, moderação e auditoria de segurança. | • Validar e gerenciar cadastros de veículos e motoristas.<br>• Visualizar relatórios de denúncias, alertas e chamados de suporte.<br>• Suspender ou banir usuários que descumprirem os Termos de Uso.<br>• Monitorar métricas gerais e indicadores de desempenho do sistema. | • Ofertar ou solicitar caronas utilizando a conta administrativa.<br>• Alterar históricos de viagens e notas sem registro formal de auditoria.<br>• Visualizar senhas ou dados sensíveis criptografados dos usuários. |

---

## 📝 4. Escopo Funcional (User Stories)

> Uma story por vez, no formato do modelo abaixo. Cada uma carrega dois eixos:
> **Prioridade (MoSCoW)** — `Must Have` é o escopo comprometido do projeto;
> `Should`/`Could` entram se sobrar tempo; o `Won't Have` vira item de *Fora de Escopo*.
> **Tamanho (esforço)** — `S` cabe numa sessão, `M` vira algumas tarefas no plano, `L` pede divisão.
> O status percorre `Draft` → `Ready` → `Live`: toda story nasce `Draft` —
> **só você promove a `Ready`** — e vira `Live` quando o PR dela é mesclado.

### US01 — Cadastro e Autenticação de Usuário · `Must Have` · `M` · Status: `Ready`

**Como** Visitante,  
**eu quero** me cadastrar informando meus dados pessoais (nome completo, e-mail, senha, telefone e gênero) e realizar login na plataforma,  
**para que** eu possa acessar o PassAí de forma identificada e utilizar os recursos de busca, oferta e reserva de caronas com segurança.

**Critérios de aceite:**

- [ ] **Dado** que sou um Visitante na tela de cadastro, **quando** preencho o formulário com dados válidos, e-mail não cadastrado e envio, **então** o sistema cria minha conta, autentica-me e me redireciona para a tela inicial.
- [ ] **Dado** que sou um Usuário cadastrado na tela de login, **quando** insiro meu e-mail e senha corretos e clico em "Entrar", **então** o sistema valida minhas credenciais e concede acesso às funcionalidades internas do aplicativo.
- [ ] **Dado** que estou na tela de cadastro, **quando** informo um e-mail já registrado, **então** o sistema exibe "Este e-mail já está em uso" e mantém os campos preenchidos (exceto a senha) para correção.
- [ ] **Dado** que estou preenchendo o cadastro, **quando** omito campos obrigatórios ou uso formato inválido, **então** o envio é bloqueado com destaque visual e mensagens de erro específicas em cada campo.
- [ ] **Dado** que estou no cadastro, **quando** insiro senha com menos de 8 caracteres, **então** o sistema bloqueia o envio e indica "A senha deve ter pelo menos 8 caracteres".
- [ ] **Dado** que estou na tela de login, **quando** insiro e-mail ou senha incorretos, **então** o sistema exibe "E-mail ou senha inválidos" sem especificar qual campo falhou, preservando a segurança.

**Regras relacionadas:** RN01, RN02, RN03

---

### US02 — Gerenciamento de Veículos do Motorista · `Must Have` · `M` · Status: `Ready`

**Como** Usuário autenticado,  
**eu quero** cadastrar, listar, editar e remover meus veículos (informando marca/modelo, cor e placa),  
**para que** eu possa me habilitar como Motorista e vincular meu veículo às ofertas de carona na plataforma.

**Critérios de aceite:**

- [ ] **Dado** que sou um Usuário autenticado na tela "Meus Veículos", **quando** clico em "Adicionar Veículo", preencho marca/modelo, cor e placa válida e confirmo, **então** o veículo é salvo com sucesso, passa a ser exibido na lista e meu perfil fica apto a ofertar caronas.
- [ ] **Dado** que possuo um ou mais veículos salvos, **quando** acesso a aba "Meus Veículos", **então** o sistema exibe a lista completa de veículos com marca/modelo, cor e placa.
- [ ] **Dado** que estou na lista de veículos cadastrados, **quando** altero os dados de um veículo e salvo, **então** os dados são atualizados no banco de dados e refletidos imediatamente na listagem.
- [ ] **Dado** que seleciono remover um veículo que não possui caronas agendadas ou em andamento, **quando** confirmo a exclusão, **então** o veículo é removido permanentemente da minha lista.
- [ ] **Dado** que estou no cadastro de veículo, **quando** insiro uma placa fora dos padrões válidos (padrão antigo ou Mercosul), **então** o sistema bloqueia o envio e exibe a mensagem "Formato de placa inválido".
- [ ] **Dado** que estou cadastrando ou editando um veículo, **quando** tento salvar omitindo campos obrigatórios, **então** o sistema impede o salvamento e destaca os campos não preenchidos.
- [ ] **Dado** que o veículo está vinculado a carona agendada ou em andamento, **quando** tento excluí-lo ou alterar sua placa, **então** o sistema bloqueia a ação com a mensagem "Não é possível alterar ou remover este veículo pois ele possui caronas agendadas. Cancele as caronas vinculadas antes de prosseguir".

**Regras relacionadas:** RN04, RN05

---

### US03 — Publicação e Gerenciamento de Ofertas de Carona · `Must Have` · `M` · Status: `Draft`

**Como** Motorista autenticado,  
**eu quero** criar, listar e cancelar ofertas de carona informando origem, destino, ponto de encontro, data, horário, número de vagas disponíveis, veículo e a opção do Modo Elas por Elas,  
**para que** passageiros com rotas compatíveis possam visualizar e solicitar um assento no meu veículo.

**Critérios de aceite:**

- [ ] **Dado** que sou um Motorista autenticado com veículo cadastrado, **quando** preencho o formulário com origem, destino, ponto de encontro, data/hora futura, vagas (1 a 6) e seleciono um veículo válido, **então** a carona é criada com status "Aberta", listada em "Minhas Ofertas" e exibida nas buscas.
- [ ] **Dado** que sou uma Motorista do sexo feminino cadastrando uma carona, **quando** marco a opção "Modo Elas por Elas", **então** a carona é criada com restrição ativa e fica visível e reservável exclusivamente para passageiras do sexo feminino.
- [ ] **Dado** que possuo caronas criadas, **quando** acesso a aba "Minhas Ofertas", **então** o sistema exibe minhas caronas organizadas por status (Abertas, Em Andamento, Concluídas e Canceladas), detalhando os passageiros confirmados.
- [ ] **Dado** que criei uma carona sem solicitações ou reservas confirmadas, **quando** seleciono a opção "Cancelar Carona", **então** o status muda para "Cancelada" e a carona deixa de aparecer nas buscas.
- [ ] **Dado** que possuo carona agendada com passageiros confirmados, **quando** confirmo o cancelamento após o aviso de impacto, **então** o status muda para "Cancelada" e uma notificação automática é enviada a todos os passageiros afetados.
- [ ] **Dado** que tento publicar carona com data ou horário anterior ao momento atual, **quando** submeto o formulário, **então** o sistema bloqueia o envio com a mensagem "A data e o horário da carona devem ser futuros".
- [ ] **Dado** que tento publicar carona informando 0 vagas ou mais de 6 vagas, **quando** tento submeter, **então** o sistema exibe "O número de vagas deve ser de no mínimo 1 e no máximo 6".
- [ ] **Dado** que sou um Motorista do sexo masculino, **quando** tento marcar a opção "Modo Elas por Elas", **então** o sistema desabilita o campo e exibe "O Modo Elas por Elas é exclusivo para motoristas e passageiras do sexo feminino".
- [ ] **Dado** que tento criar carona sem selecionar um veículo da lista, **quando** tento publicar, **então** o sistema bloqueia o envio exigindo a seleção de um veículo cadastrado.

**Regras relacionadas:** RN06, RN07, RN08, RN09

---

### US04 — Busca e Visualização de Caronas Disponíveis · `Must Have` · `M` · Status: `Ready`

**Como** Passageiro autenticado,  
**eu quero** pesquisar caronas por origem, destino ou campus da UTFPR, filtrando por data, horário e pelo Modo Elas por Elas,  
**para que** eu possa visualizar os trajetos disponíveis, a quantidade de vagas e as avaliações do Motorista antes de solicitar uma vaga.

**Critérios de aceite:**

- [ ] **Dado** que sou um Passageiro na tela de busca, **quando** informo ponto de origem ou destino e seleciono a data, **então** o sistema lista as caronas abertas correspondentes, exibindo: foto/nome do motorista, nota de avaliação, modelo do veículo, horário de saída, ponto de encontro e total de vagas restantes.
- [ ] **Dado** que sou uma Passageira do sexo feminino, **quando** ativo o filtro "Modo Elas por Elas", **então** a listagem exibe exclusivamente caronas publicadas por motoristas mulheres que habilitaram essa modalidade.
- [ ] **Dado** que estou visualizando os resultados da busca, **quando** clico em uma das caronas listadas, **então** o sistema exibe a tela de detalhes com rota prevista, histórico de avaliações do motorista e ponto de encontro.
- [ ] **Dado** que realizo pesquisa para data ou rota sem ofertas ativas, **quando** o sistema processa a busca, **então** é exibido um estado vazio amigável ("Nenhuma carona encontrada para esta rota/data") com atalho para cadastrar o trajeto em Rotas Salvas.
- [ ] **Dado** que sou um usuário do gênero masculino, **quando** acesso a tela de busca, **então** o filtro "Modo Elas por Elas" não é exibido e as caronas restritas a essa modalidade são omitidas automaticamente dos resultados.
- [ ] **Dado** que estou na busca, **quando** tento acionar a pesquisa sem informar ao menos uma origem, um destino ou a data, **então** o sistema destaca os campos necessários e solicita o preenchimento de ao menos um critério.

**Regras relacionadas:** RN08, RN10, RN11

---

### US05 — Solicitação, Confirmação e Validação de Embarque via PIN · `Must Have` · `M` · Status: `Ready`

**Como** Passageiro autenticado,  
**eu quero** solicitar uma vaga em uma carona aberta, acompanhar o aceite do motorista, obter o PIN de confirmação de embarque e validar meu início de viagem,  
**para que** eu possa me deslocar com segurança e garantir minha vaga de forma confirmada e rastreável.

**Critérios de aceite:**

- [ ] **Dado** que sou um Passageiro em uma carona com vagas disponíveis, **quando** envio uma solicitação informando o ponto de encontro desejado e o Motorista a aceita, **então** a reserva muda para "Confirmada", as vagas disponíveis diminuem em 1 e um PIN exclusivo de 4 dígitos é gerado no meu aplicativo.
- [ ] **Dado** que minha reserva está confirmada e encontro o Motorista no local combinado, **quando** informo meu PIN de 4 dígitos e o Motorista o digita no app dele, **então** o sistema valida o código, confirma o embarque presencial e transita a viagem para "Em Andamento".
- [ ] **Dado** que a carona está "Em Andamento" e o veículo atinge o destino final, **quando** o Motorista aciona "Finalizar Carona", **então** a viagem transita para "Concluída" e a interface libera a tela de avaliação mútua para ambos.
- [ ] **Dado** que enviei uma solicitação de carona, **quando** o Motorista recusa o pedido, **então** o status muda para "Recusada", a vaga permanece disponível para outros usuários e recebo uma notificação de não confirmação.
- [ ] **Dado** que o Motorista está na validação presencial, **quando** digita um PIN divergente do gerado para aquele passageiro, **então** o sistema exibe "PIN inválido. Verifique o código com o passageiro" e impede o início da viagem.
- [ ] **Dado** que possuo reserva confirmada com PIN gerado, **quando** cancelo a reserva antes do horário de saída, **então** minha reserva transita para "Cancelada", a vaga do veículo é automaticamente incrementada (+1 vaga) e o Motorista é notificado.
- [ ] **Dado** que visualizo uma carona com apenas 1 vaga restante, **quando** envio a solicitação mas outro usuário concluiu a confirmação no mesmo instante, **então** o sistema bloqueia a ação com a mensagem "Esta carona não possui mais vagas disponíveis".

**Regras relacionadas:** RN12, RN13, RN14, RN15

---

### US06 — Gerenciamento de Rotas Salvas com Autopreenchimento via CEP e Sugestões de Match · `Must Have` · `M` · Status: `Ready`

**Como** Usuário autenticado (Passageiro ou Motorista),  
**eu quero** cadastrar minhas rotas frequentes utilizando o CEP para preenchimento automático do endereço e visualizar sugestões de caronas compatíveis,  
**para que** eu possa agilizar o cadastro de rotas recorrentes e receber opções de trajetos sem precisar buscar manualmente todos os dias.

**Critérios de aceite:**

- [ ] **Dado** que estou no formulário de cadastro ou edição de Rota Salva, **quando** digito um CEP válido de 8 dígitos, **então** o sistema faz uma requisição assíncrona (GET) à API pública do ViaCEP e preenche automaticamente logradouro, bairro e cidade.
- [ ] **Dado** que o endereço foi preenchido via CEP e informei dias e horários recorrentes (ex.: Segunda a Sexta às 22h30), **quando** confirmo o salvamento, **então** a rota é persistida e exibida na aba "Minhas Rotas".
- [ ] **Dado** que possuo uma Rota Salva cadastrada, **quando** acesso o painel inicial ou a aba de sugestões, **então** o sistema cruza minha rota com as caronas abertas e exibe sugestões de trajetos compatíveis para solicitação/aceite rápido.
- [ ] **Dado** que digitei um CEP com formato válido mas inexistente na base postal, **quando** a API do ViaCEP responde, **então** o sistema exibe "CEP não encontrado", limpa os campos e permite preenchimento manual.
- [ ] **Dado** que estou preenchendo o CEP, **quando** insiro menos de 8 dígitos ou caracteres não numéricos, **então** o sistema não dispara a requisição e exibe "Informe um CEP válido com 8 dígitos".
- [ ] **Dado** que a API externa do ViaCEP estiver indisponível ou retornar falha de rede/timeout, **quando** a requisição falha, **então** o sistema trata o erro sem travar a aplicação, informa "Não foi possível buscar o CEP automaticamente" e libera os campos para digitação manual.

**Regras relacionadas:** RN16, RN17

---

### US07 — Avaliação Mútua e Histórico de Viagens · `Must Have` · `M` · Status: `Draft`

**Como** Usuário autenticado (Passageiro ou Motorista),  
**eu quero** atribuir uma nota e comentário opcional para minha contraparte ao final de uma viagem e consultar meu histórico de caronas,  
**para que** eu possa contribuir com a reputação da comunidade, reconhecer boas experiências e acompanhar meu registro de trajetos realizados.

**Critérios de aceite:**

- [ ] **Dado** que participei de uma carona que transitou para "Concluída", **quando** o sistema exibe a tela de avaliação pós-viagem, seleciono uma nota de 1 a 5 estrelas, digito um comentário opcional e envio, **então** a avaliação é registrada, vinculada à viagem e meu status de avaliação para essa carona passa a ser "Concluído".
- [ ] **Dado** que recebi uma nova avaliação de 1 a 5 estrelas, **quando** ela é registrada no banco de dados, **então** o sistema recalcula e atualiza automaticamente a nota média exibida publicamente no meu perfil.
- [ ] **Dado** que estou na aba "Histórico de Viagens", **quando** navego pela tela, **então** o sistema exibe a lista cronológica de todas as caronas das quais participei (como motorista ou passageiro), indicando data, horário, contraparte, status ("Concluída" ou "Cancelada") e nota atribuída/recebida.
- [ ] **Dado** que estou na avaliação pós-viagem, **quando** tento confirmar o envio sem ter selecionado ao menos 1 estrela, **então** o sistema bloqueia o envio com "Por favor, selecione uma nota de 1 a 5 estrelas para prosseguir".
- [ ] **Dado** que já submeti avaliação para uma carona concluída, **quando** tento acessar novamente o formulário daquela mesma viagem, **então** o sistema exibe "Você já avaliou esta carona" e oculta o formulário.
- [ ] **Dado** que participei de carona com status "Aberta", "Em Andamento" ou "Cancelada", **quando** tento avaliar a viagem, **então** a ação é bloqueada com "Avaliações só podem ser realizadas após a conclusão formal da carona".

**Regras relacionadas:** RN18, RN19, RN20

---

## 🛡️ 5. Regras de Negócio (Constraints)

| ID | Regra |
| :-- | :---- |
| **RN01** | **Dados Cadastrais Obrigatórios:** Nome completo, e-mail válido, senha com no mínimo 8 caracteres, telefone são de preenchimento obrigatório no cadastro. |
| **RN02** | **Unicidade de E-mail:** Não é permitido o cadastro de contas duplicadas utilizando o mesmo endereço de e-mail. |
| **RN03** | **Segurança de Credenciais:** Mensagens de erro no login devem ser opacas ("E-mail ou senha inválidos"), sem indicar qual campo específico divergiu. |
| **RN04** | **Habilitação de Motorista:** A publicação de caronas exige ao menos um veículo cadastrado com marca/modelo, cor e placa em formato válido (Mercosul ou padrão antigo). |
| **RN05** | **Integridade de Veículo:** Não é permitida a exclusão ou alteração de placa de veículo vinculado a caronas ativas ("Aberta" ou "Em Andamento"). 
| **RN06** | **Temporalidade da Carona:** A data e o horário de partida da carona devem ser estritamente futuros no momento da criação. |
| **RN07** | **Capacidade de Vagas:** Toda oferta de carona deve disponibilizar no mínimo 1 e no máximo 6 vagas para passageiros. |
| **RN08** | **Modo Elas por Elas:** A ativação, visualização e reserva em caronas da modalidade "Modo Elas por Elas" são restritas exclusivamente a usuárias com gênero feminino cadastrado. |
| **RN09** | **Notificação por Cancelamento:** O cancelamento de carona com reservas confirmadas altera o status para "Cancelada" e dispara notificação automática a todos os passageiros afetados. |
| **RN10** | **Parâmetros Mínimos de Busca:** A consulta por caronas exige o preenchimento de ao menos um critério de filtro (origem, destino ou data). |
| **RN11** | **Privacidade Pré-Reserva:** Dados de contato direto e endereço exato de partida só são revelados após a confirmação mútua da reserva. |
| **RN12** | **Controle de Vagas:** Cada reserva confirmada decrementa 1 vaga disponível da carona; atingindo 0 vagas, novas solicitações são bloqueadas. |
| **RN13** | **Código PIN de Segurança:** Toda reserva confirmada gera um código PIN numérico temporário de 4 dígitos de uso único, visível apenas no app do passageiro. |
| **RN14** | **Validação de Embarque:** O início formal da viagem pelo motorista ("Em Andamento") exige a digitação e validação presencial do PIN de 4 dígitos do passageiro. |
| **RN15** | **Estorno de Vagas:** O cancelamento de reserva pelo passageiro antes do horário de partida estorna automaticamente +1 vaga disponível na carona e notifica o motorista. |
| **RN16** | **Formato do CEP:** O CEP informado para autopreenchimento de endereço de rotas salvas deve conter exatamente 8 dígitos numéricos. |
| **RN17** | **Resiliência de API Externa:** Falha ou indisponibilidade da API do ViaCEP não impede o fluxo de cadastro de rota, liberando a digitação manual dos campos de endereço. |
| **RN18** | **Configuração de Nota:** A avaliação pós-viagem é configurável, permitindo que motorista e passageiro escolham atribuir ou não nota de 1 a 5 estrelas ao outro perfil, e comentários facultativos. |
| **RN19** | **Unicidade e Momento de Avaliação:** Cada participante pode avaliar a contraparte apenas uma vez por viagem e estritamente após o status da carona ser "Concluída". |
| **RN20** | **Atualização da Reputação:** A nota média de avaliação do perfil é recalculada e atualizada automaticamente a cada nova avaliação concluída. |

---

## 🚫 6. Fora de Escopo (Non-goals)

> O que o produto deliberadamente **não** faz neste semestre — o `Won't Have`
> do MoSCoW, com o motivo de cada corte.

- **Processamento de pagamentos ou split financeiro dentro do app:** O PassAí foca no transporte colaborativo; qualquer rateio de combustível é acordado diretamente entre os participantes, evitando a complexidade de gateways bancários, conciliação e conformidade financeira regulatória.
- **Rastreamento de rota em tempo real via GPS contínuo (estilo Uber/Waze):** A validação de encontro e início é garantida de forma segura e pontual pelo Ponto de Encontro e Código PIN de 4 dígitos, sem sobrecarga de bateria e telemetria contínua.
- **Chat interno em tempo real via WebSockets:** A comunicação direta entre as partes é liberada pós-aceite mútuo através de dados de contato (telefone/WhatsApp), simplificando a arquitetura sem perda de valor.
- **Integração com sistemas acadêmicos institucionais da UTFPR (SSO/Portal do Aluno):** A autenticação é autônoma via plataforma, evitando bloqueios por dependência de APIs restritas da universidade.
- **Algoritmos de roteirização geográfica curva a curva:** A correspondência de trajetos baseia-se em bairros, cidades e pontos de interesse (campus da UTFPR) cruzados com horários de saída.

---

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)

> Só os que você consegue justificar na defesa.

- **RNF01 — Responsividade Mobile-First (ID2):** A interface deve ser projetada e otimizada prioritariamente para telas de smartphones (resolução mínima a partir de 360px de largura), adaptando-se fluidamente para tablets e desktops.
- **RNF02 — Experiência PWA (ID3):** A aplicação deve fornecer manifesto de aplicativo web (`manifest.webmanifest`) com ícones próprios, cores de tema, tela de abertura (*splash screen*) e execução em modo *standalone* (sem barra de URL do navegador).
- **RNF03 — Desempenho com Deferrable Views (ID9):** O carregamento de elementos secundários (listagens de avaliações, históricos e detalhes expandidos) deve utilizar `@defer`, garantindo que o carregamento das telas principais permaneça ágil em redes móveis 4G.
- **RNF04 — Resiliência de Integração Externa (ID20):** Falhas, timeouts ou indisponibilidade da API pública do ViaCEP não devem travar a aplicação nem bloquear a jornada do usuário, acionando fallback transparente para digitação manual em menos de 3 segundos.
- **RNF05 — Segurança e Privacidade de Dados (ID21, ID23):** Todas as comunicações devem trafegar via HTTPS com autenticação JWT; dados sensíveis (endereço exato e telefone) não são expostos a visitantes ou usuários sem reserva confirmada.

---

## 🛠️ 8. Histórico

| Data | Versão | O que mudou |
| :--- | :----- | :---------- |
| 2026-09-14 | 1.0.0 | Versão inicial completa produzida via `/utf-prd` |
