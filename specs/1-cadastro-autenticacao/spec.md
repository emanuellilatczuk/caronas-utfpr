---
issue: 1
status: aprovada
---

# US01 — Cadastro e Autenticação de Usuário

## O problema

Estudantes e servidores da comunidade universitária da UTFPR que desejam compartilhar ou encontrar caronas não possuem um ambiente identificado e seguro para acessar o aplicativo, necessitando de uma forma de cadastro validada institucionalmente e autenticação confiável para garantir a identificação dos membros da comunidade e a proteção de seus dados.

## A história

**Como** Visitante,  
**eu quero** me cadastrar informando meus dados pessoais (nome completo, e-mail institucional, senha e gênero) e realizar login na plataforma,  
**para que** eu possa acessar o PassAí de forma identificada e utilizar os recursos de busca, oferta e reserva de caronas com segurança.

## Critérios de aceite

- [ ] **CA1 — Dado** que sou um Visitante na tela de cadastro (`/register`), **quando** preencho o formulário com dados válidos (nome completo, e-mail institucional `@alunos.utfpr.edu.br` ou `@utfpr.edu.br`, senha de no mínimo 8 caracteres com confirmação idêntica e gênero) e envio, **então** o sistema cria o usuário na base de dados, inicializa a sessão autenticada e redireciona para a tela inicial (`/home` ou `returnUrl`).
- [ ] **CA2 — Dado** que sou um Usuário cadastrado na tela de login (`/login`), **quando** insiro meu e-mail institucional e senha corretos e clico em "Entrar", **então** o sistema valida minhas credenciais, inicializa a sessão no `AuthService` com token e redireciona para a rota solicitada (`/home` ou `returnUrl`).
- [ ] **CA3 — Dado** que estou na tela de cadastro, **quando** informo um e-mail já registrado, **então** o sistema exibe a mensagem "Este e-mail já está em uso" e mantém os campos preenchidos (exceto os campos de senha) para correção.
- [ ] **CA4 — Dado** que estou preenchendo o formulário de cadastro, **quando** omito campos obrigatórios ou informo e-mail fora dos domínios institucionais aceitos (`@alunos.utfpr.edu.br` e `@utfpr.edu.br`), **então** o botão de submissão permanece desabilitado (`[disabled]="form.invalid"`) e mensagens de erro específicas são exibidas abaixo de cada campo inválido.
- [ ] **CA5 — Dado** que estou no cadastro, **quando** insiro senha com menos de 8 caracteres ou confirmação de senha diferente da senha digitada, **então** o sistema bloqueia o envio e indica a mensagem correspondente ("A senha deve ter pelo menos 8 caracteres" ou "As senhas não coincidem").
- [ ] **CA6 — Dado** que estou na tela de login, **quando** insiro e-mail ou senha incorretos, **então** o sistema exibe "E-mail ou senha inválidos" sem especificar qual campo falhou, preservando a segurança (RN03).
- [ ] **CA7 — Dado** que sou um Visitante não autenticado tentando acessar uma rota protegida (ex.: `/home`), **quando** a navegação é acionada, **então** o `authGuard` bloqueia o acesso e redireciona para `/login?returnUrl=<rota>`, preservando a rota pretendida para após o login.
- [ ] **CA8 — Dado** que sou um Usuário já autenticado tentando acessar `/login` ou `/register`, **quando** navego até essas rotas, **então** o `guestGuard` intercepta a navegação e me redireciona para `/home`.
- [ ] **CA9 — Dado** que o formulário de login ou cadastro é submetido mas a API/json-server está indisponível ou retorna erro de conexão/servidor (status 0 ou 5xx), **quando** a resposta de erro é recebida, **então** o sistema exibe um alerta visual de erro ("Servidor indisponível. Verifique se a API está em execução") e preserva os campos preenchidos para nova tentativa sem recarregar a tela.
- [ ] **CA10 — Dado** que o visitante está preenchendo o cadastro e fecha a aba do navegador ou recarrega a página, **quando** ele retorna à tela, **então** o formulário inicializa limpo, sem retenção de rascunhos de credenciais em cache ou armazenamento local por motivos de segurança.

## Fora de escopo

- Recuperação de senha ("esqueci minha senha") via e-mail ou SMS.
- Autenticação federada/SSO institucional integrado aos sistemas legados da UTFPR (Portal do Aluno, LDAP institucional).
- Envio de e-mail com link de confirmação/ativação de conta.
- Edição de perfil e upload de foto de avatar (pertence à feature `/profile`).
- Validação documental de motorista (CNH, CRLV) no fluxo inicial de cadastro (gerenciada no domínio de veículos / perfil).

## Abandono no meio

- **Fechamento de aba ou recarregamento durante o cadastro:** O formulário não persiste dados parciais em `localStorage`/`sessionStorage` por segurança de senhas e credenciais. Ao reabrir, o usuário inicia um fluxo limpo.
- **Falha de rede ou queda do json-server durante a submissão:** O erro é capturado pelo serviço sem quebrar a aplicação, exibindo um alerta visual destacado e mantendo os dados preenchidos pelo usuário para que ele possa reenviar assim que a conexão for restabelecida.
- **Tentativa de acesso direto a links internos:** O `authGuard` captura a rota pretendida no parâmetro `returnUrl` da URL de login, assegurando que o usuário retorne exatamente para onde pretendia ir após autenticar-se.

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| Armazenamento local de usuários e sessão em json-server (`apps/api/db.json`) e `localStorage`, migrando para Supabase Auth na Entrega 3 | E3-Supabase |

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |

