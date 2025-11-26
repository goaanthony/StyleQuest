# StyleQuest

> Application desktop Tauri (frontend Vite + TypeScript) propulsée par Bun.

## Prérequis

- [Bun](https://bun.sh/) 
- [Rust](https://www.rust-lang.org/tools/install)
- Outils natifs selon l'OS (Visual Studio Build Tools sur Windows, Xcode sur macOS, build-essential sur Linux)

## Installation

```pwsh
bun install
```

Cela installe les dépendances frontend et l'outillage Tauri.

## Lancer l'app en dev

```pwsh
bun tauri dev
```

- démarre Vite en mode HMR sur `http://localhost:1420`
- ouvre la fenêtre Tauri rechargée à chaud à chaque sauvegarde

## Construire la version production

```pwsh
# build frontend + bundle natif
bun tauri build
```

Les artefacts sont générés dans `src-tauri/target` (debug/release) et les installateurs dans `src-tauri/target/release/bundle`.

Pour un build frontend seul (sans bundle natif):

```pwsh
bun run build
```

## Scripts utiles

| Commande | Description |
| --- | --- |
| `bun run dev` | Lance uniquement Vite (utile pour itérer sur l'UI sans la partie native). |
| `bun tauri dev` | Stack complète (frontend + shell Tauri). |
| `bun run build` | Produit `dist/` pour la partie web. |
| `bun tauri build` | Génère les binaires/installeurs multiplateformes. |

## Structure rapide

- `src/`: UI (TypeScript + CSS)
- `src-tauri/`: code Rust, config Tauri et icônes
- `vite.config.ts`, `tsconfig.json`: configuration frontend
- `bun.lock`: verrouillage des dépendances Bun

## IDE recommandés

- [VS Code](https://code.visualstudio.com/)
	- Extension [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
	- Extension [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
