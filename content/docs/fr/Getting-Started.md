---
title: Bien démarrer
---

Ce guide explique comment installer le projet, l'exécuter en local, et présente les quelques commandes que vous utiliserez au quotidien. Pour un tour d'horizon de la façon dont les pièces s'assemblent, voir [Architecture](/docs/fr/Architecture).

## Prérequis

* [Bun](https://bun.sh) —— le gestionnaire de paquets et le runtime JS/TS de ce projet. Installez-le avec :

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

* Git, pour cloner le dépôt et pour les commits de contenu du CMS adossé à Git.

***

## Installation

Clonez le dépôt et installez les dépendances :

```bash
git clone <repository-url>
cd <repository-directory>
bun install
```

`bun install` déclenche aussi le script `prepare` (`panda codegen`), qui génère le système de design [PandaCSS](https://panda-css.com) dans `design-system/` —— les recipes, tokens et helpers JSX que les composants d'UI importent. Si vous voyez un jour des erreurs de type pointant vers un module `design-system` manquant, relancez-le directement :

```bash
bun panda codegen
```

***

## Lancer le serveur de développement

```bash
bun run dev
```

Cela démarre le serveur de développement Vite (`http://localhost:5173` par défaut) avec HMR. Il exécute le serveur HonoX en direct —— routes, islands et styles se reconstruisent à chaque sauvegarde.

Pour éditer le contenu via l'interface du CMS plutôt qu'en modifiant à la main les fichiers sous `content/`, ouvrez `/admin/` pendant que le serveur de développement tourne.

***

## Build et prévisualisation

```bash
bun run build
```

Cette commande exécute deux passes Vite sur la même configuration —— une pour le bundle d'hydratation client, une pour les pages rendues côté serveur —— puis [`@hono/vite-ssg`](https://github.com/honojs/vite-plugins/tree/main/packages/ssg) parcourt chaque route et la pré-rend en HTML statique dans `dist/`. Voir [Architecture](/docs/fr/Architecture) pour le détail complet.

Pour servir ce résultat statique en local via le runtime local de Cloudflare (plus proche de la production que `bun run dev`) :

```bash
bun run preview
```

***

## Tests et Lint

Lancer les tests unitaires :

```bash
bun test unit
```

Linter et corriger automatiquement avec [Biome](https://biomejs.dev) :

```bash
bun run check
```

***

## Déploiement

```bash
bun run deploy
```

Construit le site et déploie `dist/` sur Cloudflare Pages via `wrangler`. Une cible Vercel (`vercel.json`) est également configurée par défaut si vous préférez déployer là-bas —— dans les deux cas, le résultat est un site entièrement statique, sans aucun processus serveur requis au moment de la requête.

***

## Pour aller plus loin

* [Architecture](/docs/fr/Architecture) —— comment le routage, les styles, le contenu et le pipeline de build s'assemblent.
* [Hydratation](/docs/fr/Hydration) —— le modèle à trois niveaux pour décider si un composant envoie du JS au client.
* [Constructeur de pages CMS](/docs/fr/PageBuilder) —— construction visuelle de pages via Sveltia CMS.
