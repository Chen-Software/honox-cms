---
title: Primeiros Passos
---

Este guia explica como instalar o projeto, executá-lo localmente e conhecer os comandos que você usará no dia a dia. Para uma visão de como as peças se encaixam, consulte [Arquitetura](/docs/pt/Architecture).

## Pré-requisitos

* [Bun](https://bun.sh) —— o gerenciador de pacotes e runtime de JS/TS deste projeto. Instale com:

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

* Git, para clonar o repositório e para os commits de conteúdo do CMS baseado em Git.

***

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone <repository-url>
cd <repository-directory>
bun install
```

`bun install` também dispara o script `prepare` (`panda codegen`), que gera o sistema de design do [PandaCSS](https://panda-css.com) em `design-system/` —— os recipes, tokens e helpers de JSX que os componentes de UI importam. Se em algum momento aparecerem erros de tipo apontando para um módulo `design-system` ausente, execute-o novamente de forma direta:

```bash
bun panda codegen
```

***

## Executando o servidor de desenvolvimento

```bash
bun run dev
```

Isso inicia o servidor de desenvolvimento do Vite (`http://localhost:5173` por padrão) com HMR. Ele executa o servidor HonoX ao vivo —— rotas, islands e estilos são reconstruídos a cada salvamento.

Para editar conteúdo pela interface do CMS em vez de editar manualmente os arquivos em `content/`, abra `/admin/` enquanto o servidor de desenvolvimento estiver rodando.

***

## Build e pré-visualização

```bash
bun run build
```

Isso executa duas passadas do Vite sobre a mesma configuração —— uma para o bundle de hidratação do cliente, outra para as páginas renderizadas no servidor —— e então o [`@hono/vite-ssg`](https://github.com/honojs/vite-plugins/tree/main/packages/ssg) percorre cada rota e as pré-renderiza como HTML estático em `dist/`. Veja [Arquitetura](/docs/pt/Architecture) para o detalhamento completo.

Para servir esse output estático localmente através do runtime local da Cloudflare (mais próximo da produção do que `bun run dev`):

```bash
bun run preview
```

***

## Testes e Lint

Execute os testes unitários:

```bash
bun test unit
```

Faça lint e correção automática com o [Biome](https://biomejs.dev):

```bash
bun run check
```

***

## Deploy

```bash
bun run deploy
```

Compila o site e implanta `dist/` no Cloudflare Pages via `wrangler`. Também há um target do Vercel (`vercel.json`) configurado de fábrica, caso prefira implantar por lá —— de qualquer forma, o resultado é um site totalmente estático, sem necessidade de nenhum processo de servidor em tempo de requisição.

***

## Próximos passos

* [Arquitetura](/docs/pt/Architecture) —— como roteamento, estilos, conteúdo e o pipeline de build se encaixam.
* [Hidratação](/docs/pt/Hydration) —— o modelo de três camadas para decidir se um componente envia JS para o cliente.
* [Construtor de Páginas CMS](/docs/pt/PageBuilder) —— construção visual de páginas através do Sveltia CMS.
