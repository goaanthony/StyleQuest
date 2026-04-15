# Architecture

## But

Rendre le projet plus lisible et évolutif en clarifiant :
- où vit le frontend (Vite)
- où vit l’API (Elysia)
- comment Tauri consomme le frontend

## Vue d’ensemble

- **Frontend** : Vite + Vue 3 (dev server sur `http://localhost:1420`), root configuré sur `src/public/pages`.
- **Desktop** : Tauri charge le frontend via `devUrl` en dev, et via `dist/` en build.
- **Backend** : Elysia (port `3000` par défaut) pour les endpoints API locaux.

## Dossiers

- `src/public/pages/`
  - Root Vite.
  - Contient `index.html` qui monte l’app Vue sur `#app`.

- `src/main.ts`
  - Bootstrap Vue (création de l’app + injection du router et de Pinia).
  - Charge les styles globaux via `src/styles/index.ts`.

- `src/router/`
  - Définition des routes (Vue Router). Utilise `createWebHashHistory()` pour être robuste sous Tauri (`file://` en production).

- `src/pages/` + `src/components/` + `src/stores/`
  - Pages / composants / état global (Pinia).

- `src/styles/index.ts`
  - Point d’entrée unique pour les styles (CSS/SCSS). À mesure que le design system grandit, on garde un seul endroit pour enregistrer les fichiers globaux.

- `src/public/components/`
  - Styles et composants UI (aujourd’hui en SCSS).

- `server/index.ts`
  - Serveur API Elysia.
  - Route `GET /health`.
  - Optionnel: servir `dist/` avec `SERVE_STATIC=true`.

## Conventions recommandées

- Aliases d’import :
  - `@/*` -> `src/*`
  - `@public/*` -> `src/public/*`

## Prochaines améliorations (facultatif)

- Ajouter des layouts plus riches (si besoin) et découper les pages en sous-composants.
- Ajouter un `server.proxy` Vite pour un préfixe `/api` si vous consommez l’API Elysia depuis le frontend.
- Renforcer la convention de nommage (pages `*Page.vue`, composants `PascalCase`).
