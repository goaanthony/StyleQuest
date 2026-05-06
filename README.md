# 🎨 StyleQuest

Application desktop moderne construite avec **Tauri**, **Vite**, **Vue 3**, **Elysia** et **Bun**.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Bun](https://bun.sh/) (runtime JavaScript ultra-rapide)
- [Rust](https://www.rust-lang.org/) (pour Tauri)

## 🏗️ Architecture du Projet

```
StyleQuest/
├── index.html         # Point d'entree Vite
├── src/                 # Frontend (Vite)
│   ├── main.ts         # Bootstrap Vue (app + router + pinia)
│   ├── data/           # Donnees (exercices)
│   ├── styles/         # Styles globaux + UI (CSS/SCSS)
│   ├── router/         # Vue Router
│   ├── views/          # Pages + composants Vue
│   └── state/          # Stores + logique partagee
├── server/              # Backend Elysia
│   └── index.ts        # Serveur API HTTP
├── src-tauri/           # Application Tauri (Rust)
│   ├── src/
│   │   ├── main.rs     # Point d'entrée Rust
│   │   └── lib.rs      # Bibliothèque Rust
│   ├── tauri.conf.json # Configuration Tauri
│   └── Cargo.toml      # Dépendances Rust
├── package.json         # Dépendances Node/Bun
└── tsconfig.json        # Configuration TypeScript
```

Notes:
- Le point d'entree Vite est `index.html` a la racine du projet.
- Le serveur Elysia expose une route `GET /health` et écoute par défaut sur `3000`.
- Le frontend est une SPA Vue : les routes sont gérées côté client via Vue Router.

## 🚀 Installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/goaanthony/StyleQuest.git
   cd StyleQuest
   ```

2. **Installer les dépendances**
   ```bash
   bun install
   ```

## 💻 Développement

### Lancer l'application en mode développement

```bash
bun run tauri dev
```

Cette commande :
- Démarre le serveur Elysia sur `http://localhost:3000`
- Lance l'application Tauri qui charge l'interface

### Lancer uniquement le serveur Elysia

```bash
bun run server
```

Le serveur sera accessible sur `http://localhost:3000`

## 🏭 Production

### Build de l'application

```bash
bun run tauri build
```

L'exécutable sera généré dans `src-tauri/target/release/`

## 🛠️ Stack Technique

- **Frontend** : Vue 3 + TypeScript + Vue Router + Pinia (Vite)
- **Backend** : Elysia (framework web ultra-rapide pour Bun)
- **Desktop** : Tauri (alternative légère à Electron)
- **Runtime** : Bun (remplace Node.js)
- **Langage système** : Rust

## 📦 Dépendances Principales

- `elysia` - Framework web minimaliste et performant
- `@tauri-apps/api` - API Tauri pour JavaScript
- `@tauri-apps/cli` - CLI Tauri
- `vue` - Framework UI
- `vue-router` - Routing SPA (hash history pour Tauri)
- `pinia` - State management

## 📝 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `bun run server` | Lance le serveur Elysia |
| `bun run tauri dev` | Mode développement (serveur + Tauri) |
| `bun run tauri build` | Build de production |
| `bun run dev` | Lance Vite (dev server alternatif) |

## 💡 Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

**Liens du repo** - [StyleQuest](https://github.com/goaanthony)
