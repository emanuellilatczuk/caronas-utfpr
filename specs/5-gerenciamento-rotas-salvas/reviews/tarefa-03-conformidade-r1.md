# Parecer de Conformidade — Tarefa 3

**Veredito:** APONTAMENTOS

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — Busca por CEP, emissão do endereço ao pai e campo correspondente editável | não atendido | `cep-search-input.component.ts:37-43` emite o endereço; `cep-search-input.component.html:4-13` contém apenas o campo de CEP |
| CA2 — Erros inline, busca não bloqueante e entrada manual no campo principal | não atendido | `cep-search-input.component.html:4-13`; `cep-search-input.component.spec.ts:76-83` |
| CA10 — ID12: `model()` com two-way binding | atendido | `cep-search-input.component.ts:15`; `days-selector.component.ts:13`; testes de binding nos respectivos `.spec.ts` |
| CA10 — ID14: comunicação tipada com `input()`/`output()` | atendido | `cep-search-input.component.ts:15-16`; host de teste em `cep-search-input.component.spec.ts:11-16` |
| Testes solicitados | atendido | Comando executado: **2 arquivos e 9 testes passaram** |

## Apontamentos
1. **O diff não implementa nem verifica a edição manual do endereço principal após a busca.** O componente emite o endereço ao pai, mas seu template apresenta somente o input de CEP; no teste, o pai apenas armazena a emissão em um `signal`, sem campo de endereço editável. Além disso, a asserção de campo habilitado verifica o input de CEP, não o campo principal. Critérios violados: CA1 e CA2 (`spec.md:20-21`). Evidência: `cep-search-input.component.ts:42`; `cep-search-input.component.html:4-13`; `cep-search-input.component.spec.ts:11-22, 76-83`.

## Sugestões
- Acrescentar um teste de integração com o campo de endereço do formulário, verificando que o resultado é preenchido e continua editável para complemento ou digitação manual.
