---
title: Erste Schritte
---

Diese Anleitung führt durch die Installation des Projekts, das lokale Ausführen und die wenigen Befehle, die im Alltag gebraucht werden. Einen Überblick, wie die einzelnen Teile zusammenspielen, gibt [Architektur](/docs/de/Architecture).

## Voraussetzungen

* [Bun](https://bun.sh) —— der Paketmanager und JS/TS-Laufzeit dieses Projekts. Installation:

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

* Git, zum Klonen des Repositories und für die Git-basierten Content-Commits des CMS.

***

## Installation

Repository klonen und Abhängigkeiten installieren:

```bash
git clone <repository-url>
cd <repository-directory>
bun install
```

`bun install` löst außerdem das `prepare`-Skript (`panda codegen`) aus, das das [PandaCSS](https://panda-css.com)-Designsystem nach `design-system/` generiert —— die Recipes, Tokens und JSX-Helper, die von den UI-Komponenten importiert werden. Falls Typfehler auf ein fehlendes `design-system`-Modul hinweisen, kann es direkt erneut ausgeführt werden:

```bash
bun panda codegen
```

***

## Entwicklungsserver starten

```bash
bun run dev
```

Damit startet Vites Entwicklungsserver (standardmäßig `http://localhost:5173`) mit HMR. Er betreibt den live laufenden HonoX-Server —— Routen, Islands und Styles werden bei jedem Speichern neu gebaut.

Um Inhalte über die CMS-Oberfläche statt manuell in den Dateien unter `content/` zu bearbeiten, `/admin/` öffnen, während der Entwicklungsserver läuft.

***

## Build & Vorschau

```bash
bun run build
```

Dabei laufen zwei Vite-Durchläufe über dieselbe Konfiguration —— einer für das Client-Hydration-Bundle, einer für die serverseitig gerenderten Seiten —— anschließend durchläuft [`@hono/vite-ssg`](https://github.com/honojs/vite-plugins/tree/main/packages/ssg) jede Route und rendert sie vorab als statisches HTML nach `dist/`. Details dazu in [Architektur](/docs/de/Architecture).

Um dieses statische Ergebnis lokal über die lokale Laufzeitumgebung von Cloudflare bereitzustellen (näher an Produktion als `bun run dev`):

```bash
bun run preview
```

***

## Tests & Lint

Unit-Tests ausführen:

```bash
bun test unit
```

Mit [Biome](https://biomejs.dev) linten und automatisch korrigieren:

```bash
bun run check
```

***

## Deployment

```bash
bun run deploy
```

Baut die Seite und deployt `dist/` via `wrangler` auf Cloudflare Pages. Ein Vercel-Ziel (`vercel.json`) ist ebenfalls von Haus aus konfiguriert, falls dort deployt werden soll —— in beiden Fällen ist das Ergebnis eine vollständig statische Seite, die zur Laufzeit keinen Serverprozess benötigt.

***

## Weiterführend

* [Architektur](/docs/de/Architecture) —— wie Routing, Styling, Inhalte und die Build-Pipeline zusammenspielen.
* [Hydration](/docs/de/Hydration) —— das dreistufige Modell zur Entscheidung, ob eine Komponente JS an den Client sendet.
* [CMS-Seitenbaukasten](/docs/de/PageBuilder) —— visuelles Erstellen von Seiten über Sveltia CMS.
