# StyleQuest

StyleQuest est une application desktop pour apprendre à coder par la pratique. Chaque parcours associe des leçons, des exercices interactifs et un suivi de progression.

## Technologies

- Interface : Vue 3, TypeScript, Vite et Pinia
- API : Elysia, Bun et SQLite
- Application desktop : Tauri 2
- Éditeur : Monaco Editor

## Prérequis

- [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install) pour le développement et la compilation Tauri

## Installation et lancement

```bash
bun install
```

Copie `.env.example` vers `.env.local`, puis ajuste les valeurs locales.

Lancer l'interface web :

```bash
bun run dev
```

Lancer l'API dans un autre terminal :

```bash
bun run server
```

Lancer l'application desktop :

```bash
bun run tauri dev 
```

Vérifier la compilation de l'interface :

```bash
bun run build
```

## Configuration

Les variables locales sont définies dans `.env.local` (fichier ignoré par Git) :

| Variable | Usage | Valeur locale |
|---|---|---|
| `VITE_API_URL` | URL de l'API pour l'interface | `http://localhost:3000/api` |
| `PORT` | Port du serveur API | `3000` |
| `JWT_SECRET` | Clé de signature des sessions | À remplacer par une valeur aléatoire |

## Organisation

```text
frontend/                 Interface Vue
  src/app/                Démarrage et routes
  src/pages/              Écrans d'accueil et de profil
  src/features/           Authentification et apprentissage
  src/components/common/  Composants partagés
  src/styles/             Styles globaux
backend/src/                  API Elysia et accès SQLite
  routes/                     Routes HTTP
  learning/css-validation/    Validation des exercices CSS
backend/stylequest.sqlite     Base SQLite locale
content/languages/            Contenus pédagogiques par langage
src-tauri/                    Application native Tauri
docs/                         Documentation du projet
```

Les nouveaux parcours sont ajoutés dans `content/languages/<langage>/`. Leur interface et leur logique de validation restent dans leurs domaines frontend et backend respectifs.
