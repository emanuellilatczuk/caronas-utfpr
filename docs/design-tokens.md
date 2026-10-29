# 🎨 Tokens de Design

**Projeto:** PassAí  
**Versão:** 1.0.1  
**Última atualização:** 2026-10-29  
**Framework CSS:** Tailwind CSS (ID5)  

> 🤖 **Este documento existe para a IA parar de inventar um botão diferente a cada tela.**
> Não é um design system completo — é o mínimo que dá à prototipagem assistida algo a que obedecer.
> Decisões visuais consolidadas via `/utf-design`.

---

## Paleta

Nome semântico, nunca `azul-2` — a cor muda, o papel dela não.

| Token | Valor | Onde se usa |
| :--- | :--- | :--- |
| `primaria` | `#4D389B` | Ação principal / destaque da marca / botões principais |
| `primaria-hover` | `#3D2C7B` | Estado hover da `primaria` |
| `texto-inverso` | `#FFFFFF` | Texto e ícones sobre fundo `primaria` |
| `superficie` | `#FFFFFF` | Fundo de cards, modais, painéis e diálogos |
| `texto` | `#132436` | Texto principal, títulos e elementos de alto contraste |
| `texto-suave` | `rgba(19, 36, 54, 0.70)` (`#132436` 70%) | Legendas, rótulos de apoio e textos secundários |
| `perigo` | `#DC2626` | Mensagens de erro, ações de cancelamento e exclusão |
| `sucesso` | `#28A745` | Confirmações, carona aceita/iniciada e badges positivos |
| `desabilitado` | `rgba(19, 36, 54, 0.60)` (`#132436` 60%) | Elementos inativos, bordas e textos desabilitados |
| `fundo` | `rgba(242, 236, 236, 0.60)` (`#F2ECEC` 60%) | Background geral da aplicação, campos de inputs e selects |
| `icones-inativos` | `rgba(19, 36, 54, 0.60)` (`#132436` 60%) | Ícones inativos na barra de navegação e controles secundários |

---

## Escala de Espaçamento

Uma progressão única baseada na escala do Tailwind CSS (múltiplos de 4px / 8px).

| Token | Valor | Uso típico |
| :--- | :--- | :--- |
| `xs` | `4px` (`0.25rem`) | Micro espaçamentos internos, gaps pequenos entre ícone e badge |
| `sm` | `8px` (`0.5rem`) | Espaçamento compacto, paddings de chips e botões menores |
| `md` | `16px` (`1rem`) | Espaçamento padrão de cards, margens de blocos e gaps de lista |
| `lg` | `24px` (`1.5rem`) | Respiros entre seções de conteúdo e cabeçalhos |
| `xl` | `32px` (`2rem`) | Separação maior de fluxos, margem superior de formulários |

---

## Tipografia

Combinação tipográfica: **Outfit** para impacto e ações principais; **Poppins** para corpo de texto, rótulos e navegação.

| Token | Família · tamanho · peso | Papel |
| :--- | :--- | :--- |
| `display` | Outfit · 24px · Bold (700) | Título principal, saudações de impacto na home |
| `heading` | Outfit · 15px · Bold (700) | Título de seção e cabeçalhos de cards |
| `subhead` | Poppins · 13px · Medium (500) | Título de item e subcabeçalhos informativos |
| `body` | Poppins · 13px · Medium (500) | Texto padrão, conteúdo corrido e campos de input |
| `caption` | Poppins · 11px · Regular (400) | Subtexto, notas de apoio e legendas |
| `label` | Poppins · 10px · SemiBold (600) | Rótulos de campos de formulário |
| `button-primary` | Outfit · 14px · SemiBold (600) | Rótulo de botões de ação principal |
| `nav-active` | Poppins · 11px · Bold (700) | Item selecionado na barra de navegação inferior |
| `nav-inactive` | Poppins · 11px · Medium (500) | Item inativo na barra de navegação inferior |

---

## Estados de Botão

Padrão para o botão de ação principal (cor primária com cantos `rounded-xl` / 12px):

| Estado | Aparência |
| :--- | :--- |
| **normal** | Fundo `primaria`, texto `texto-inverso`, cantos arredondados `rounded-xl` (12px), Outfit 14px SemiBold |
| **hover** | Fundo `primaria-hover`, cursor do tipo `pointer` com transição suave |
| **foco (teclado)** | Anel de acessibilidade com `outline-none ring-2 ring-primaria ring-offset-2` |
| **desabilitado** | Opacidade reduzida a 50%, cursor bloqueado (`not-allowed`), sem efeito hover |
| **carregando** | Spinner circular girando no centro do botão, texto omitido e clique desabilitado |

---

## Breakpoints (Mobile-First)

O design nasce para a menor tela e cresce progressivamente (ID2). Toda tela do protótipo tem versão mobile antes da versão desktop.

| Token | Largura mínima | Vale para |
| :--- | :--- | :--- |
| `base` | `< 640px` | Smartphones (layout padrão da jornada de caronas) |
| `sm` | `640px` | Smartphones grandes e visualização horizontal |
| `md` | `768px` | Tablets e telas intermediárias |
| `lg` | `1024px` | Desktops e notebooks |
| `xl` | `1280px` | Telas amplas e monitores de alta resolução |

---

## Identidade PWA

Os valores abaixo alimentam o `manifest.webmanifest` no `/utf-setup` (ID3).

| Campo | Valor |
| :--- | :--- |
| Nome do app (`name`) | `PassAí — Caronas Universitárias UTFPR` |
| Nome curto (`short_name`) | `PassAí` |
| Cor de tema (`theme_color`) | `#4D389B` (valor de `primaria`) |
| Cor de fundo da splash (`background_color`) | `#4D389B` (valor de `primaria`) |
| Elemento visual de abertura | Logo do PassAí centralizado em destaque |
| Ícones | `assets/icons/icon-512x512.png` (com variantes 192x192 e maskable) |
| Modo de exibição (`display`) | `standalone` |
| Comportamento visual offline | Banner fixo no topo "Você está offline" mantendo visível a última carona confirmada/PIN em cache, com os botões de ação temporariamente desativados |

---

## Protótipo

- **Ferramenta:** Stitch (Google)
- **Link:** [Protótipo no Stitch](https://stitch.google.com/preview/7057279136565611126?node-id=069440b5e4e9464a9fedad673abb25bf)
- **Jornadas cobertas:** Autenticação, cadastro de veículos, publicação de carona, busca e filtragem de caronas (incluindo Modo Elas por Elas), solicitação de reserva, geração e conferência de PIN no embarque presencial, e Rotas Salvas.
- **Ainda sem tela no protótipo:** avaliação pós-viagem (US07, `Draft`).
