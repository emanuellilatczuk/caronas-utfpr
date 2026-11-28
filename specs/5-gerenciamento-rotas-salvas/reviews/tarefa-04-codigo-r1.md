# Parecer de Código — Tarefa 4

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **Carregamentos concorrentes podem preencher o formulário com a rota errada** — `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.ts:81-86, 129-137`  
   Regra violada: o `id` é capturado por `input()` e reage via `effect()`, conforme a arquitetura, mas o efeito não protege a atualização assíncrona contra mudanças posteriores do `id`.  
   Prejuízo concreto: se a navegação entre IDs ocorrer antes de uma consulta terminar, uma resposta antiga pode sobrescrever o formulário. O submit então lê o `id()` atual e pode atualizar essa outra rota com os dados antigos.

2. **Mensagens de validação não estão associadas acessivelmente aos campos** — `apps/web/src/app/features/saved-routes/pages/saved-routes/saved-routes.component.html:27-35, 51-59, 73-81, 101-109`  
   Regra violada: falta indicar programaticamente o estado inválido e associar o erro ao campo. A Home já demonstra esse padrão em `home.component.html:69-86`.  
   Prejuízo concreto: tecnologias assistivas não recebem `aria-invalid` nem uma referência `aria-describedby` para as mensagens; usuários podem não identificar qual campo está inválido.

## Sugestões (não bloqueiam)

- O estado de carregamento mostra “Salvando...” (`saved-routes.component.html:141`), enquanto os tokens especificam spinner e texto omitido. A classe `hover:bg-primaria-hover` também permanece no botão desabilitado (`:138`); alinhar o hover e o carregamento aos estados documentados.
- `routeForm` é um alias sem uso no diff (`saved-routes.component.ts:59`); removê-lo evitaria manter duas referências para o mesmo formulário.

**Consistência visual:** a tela usa estilos no template, como a Home, e mantém boa coerência em superfície, cores, campos, espaçamento e tokens tipográficos.

**Verificações:** build concluído com sucesso. O teste focado passou: **6 testes**; a primeira tentativa teve timeout ao iniciar o worker, mas a repetição passou.

## Observações fora do escopo deste diff

- Nenhuma.
