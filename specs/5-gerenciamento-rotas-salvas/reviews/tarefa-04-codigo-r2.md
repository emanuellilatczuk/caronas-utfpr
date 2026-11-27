# Parecer de Código — Tarefa 4

**Veredito:** APONTAMENTOS

Os itens aceitos na r1 foram corrigidos: proteção contra resposta assíncrona antiga, associação dos erros aos campos, teste do CEP nos campos de Origem e Destino, spinner acessível sem hover durante o salvamento e remoção do alias `routeForm`.

## Apontamentos (bloqueiam)

1. **Rota de edição não encontrada falha sem feedback** — `saved-routes.component.ts:151-155`  
   Regra violada: tratamento de falha não deve ser silenciosamente ignorado; a CA5 prevê carregar a rota persistida para edição.  
   Prejuízo concreto: se o ID não existir ou a rota não pertencer ao usuário, o formulário permanece vazio, sem mensagem, e o botão continua desabilitado. Informe que a rota não está disponível ou não foi encontrada.

## Sugestões (não bloqueiam)

- Nenhuma.

## Observações fora do escopo deste diff

- Build concluído com sucesso.
- O teste teve timeout na primeira execução; repetido após o build, passou: **11 testes**.
