---
title: Primeros Pasos
---

Esta guía explica cómo instalar el proyecto, ejecutarlo en local y conocer los comandos que usarás día a día. Para un recorrido por cómo encajan las piezas, consulta [Arquitectura](/docs/es/Architecture).

## Requisitos previos

* [Bun](https://bun.sh) —— el gestor de paquetes y runtime de JS/TS de este proyecto. Instálalo con:

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

* Git, para clonar el repositorio y para los commits de contenido del CMS basado en Git.

***

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone <repository-url>
cd <repository-directory>
bun install
```

`bun install` también dispara el script `prepare` (`panda codegen`), que genera el sistema de diseño de [PandaCSS](https://panda-css.com) en `design-system/` —— los recipes, tokens y helpers de JSX que importan los componentes de la UI. Si alguna vez ves errores de tipos apuntando a un módulo `design-system` faltante, vuelve a ejecutarlo directamente:

```bash
bun panda codegen
```

***

## Ejecutar el servidor de desarrollo

```bash
bun run dev
```

Esto inicia el servidor de desarrollo de Vite (`http://localhost:5173` por defecto) con HMR. Ejecuta el servidor HonoX en vivo —— rutas, islands y estilos se reconstruyen al guardar.

Para editar contenido a través de la interfaz del CMS en lugar de editar a mano los archivos bajo `content/`, abre `/admin/` mientras el servidor de desarrollo está corriendo.

***

## Compilación y previsualización

```bash
bun run build
```

Esto ejecuta dos pasadas de Vite sobre la misma configuración —— una para el bundle de hidratación del cliente, otra para las páginas renderizadas en el servidor —— y luego [`@hono/vite-ssg`](https://github.com/honojs/vite-plugins/tree/main/packages/ssg) recorre cada ruta y las pre-renderiza como HTML estático en `dist/`. Consulta [Arquitectura](/docs/es/Architecture) para el detalle completo.

Para servir ese output estático en local a través del runtime local de Cloudflare (más cercano a producción que `bun run dev`):

```bash
bun run preview
```

***

## Pruebas y Lint

Ejecuta las pruebas unitarias:

```bash
bun test unit
```

Lintea y corrige automáticamente con [Biome](https://biomejs.dev):

```bash
bun run check
```

***

## Despliegue

```bash
bun run deploy
```

Compila el sitio y despliega `dist/` en Cloudflare Pages mediante `wrangler`. También hay un target de Vercel (`vercel.json`) configurado de fábrica si prefieres desplegar ahí —— en cualquier caso, el resultado es un sitio completamente estático que no requiere ningún proceso de servidor en tiempo de petición.

***

## Próximos pasos

* [Arquitectura](/docs/es/Architecture) —— cómo encajan el enrutamiento, los estilos, el contenido y el pipeline de compilación.
* [Hidratación](/docs/es/Hydration) —— el modelo de tres niveles para decidir si un componente envía JS al cliente.
* [Constructor de Páginas CMS](/docs/es/PageBuilder) —— construcción visual de páginas a través de Sveltia CMS.
