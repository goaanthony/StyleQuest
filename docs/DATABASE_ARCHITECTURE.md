# 🎮 StyleQuest - Architecture DB & Sync

## Architecture globale

```
┌─────────────────────┐        ┌──────────────────┐
│  Tauri App (Win)    │        │  Web Browser     │
│  ├─ Vue 3           │        │  ├─ Vue 3        │
│  ├─ Pinia Store     │        │  ├─ Pinia Store  │
│  ├─ localStorage    │        │  ├─ localStorage │
│  └─ SQLite Local DB │        │  └─ IndexedDB    │
└──────────┬──────────┘        └────────┬─────────┘
           │                            │
           │        Auto-Sync (30s)     │
           └────────────┬───────────────┘
                        │
                        ▼
          ┌──────────────────────────┐
          │  Backend (Elysia)        │
          │  ├─ Port: 3000           │
          │  ├─ SQLite Central DB    │
          │  └─ Leaderboard Service  │
          └──────────────────────────┘
```

## Base de données

### Tables (6 total)

1. **users** - Profils pseudonymes
   - `id`, `pseudo` (unique), `total_xp`, `current_level`, `current_streak`, `longest_streak`

2. **daily_sessions** - Sessions quotidiennes (XP par jour)
   - `id`, `user_id`, `session_date`, `xp_earned`, `exercises_completed`

3. **user_progress** - Progression détaillée des exercices
   - `id`, `user_id`, `exercise_id`, `xp_gained`, `completed_at`

4. **completed_modules** - Modules complétés
   - `id`, `user_id`, `module_id`, `completed_at`

5. **completed_notions** - Notions complétées
   - `id`, `user_id`, `module_id`, `notion_id`, `completed_at`

6. **level_ups** - Historique des montées de niveau
   - `id`, `user_id`, `previous_level`, `new_level`, `achieved_at`

### Calcul du niveau

```typescript
level = Math.floor(total_xp / 100) + 1
```

## Endpoints API

### POST `/api/scores`
Enregistrer un score (rate-limited: 10/min par IP)

```json
{
  "pseudo": "SwiftFox42",
  "exerciseId": "1-1-1",
  "moduleId": 1,
  "notionId": "1-1",
  "xpGained": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "+30 XP enregistrés !",
  "userXP": 2450,
  "userLevel": 25
}
```

### GET `/api/leaderboard`
Retourne les 100 meilleurs joueurs

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "pseudo": "SwiftFox42",
      "total_xp": 15250,
      "current_level": 153,
      "current_streak": 42,
      "longest_streak": 89
    },
    ...
  ]
}
```

### GET `/api/user/:pseudo`
Récupérer les données d'un utilisateur

## Stores Pinia

### `useUserStore`
- `pseudo` - Pseudo pseudonyme unique
- `totalXP` - Total d'XP accumulé
- `currentLevel` - Niveau courant
- `currentStreak` / `longestStreak` - Streaks
- `pendingScores` - Scores en attente de sync

**Méthodes:**
- `addLocalScore()` - Ajouter un score localement
- `loadFromPersistence()` - Charger depuis localStorage
- `saveToPersistence()` - Sauvegarder localement
- `syncWithServer()` - Synchroniser avec le serveur
- `fetchUserData()` - Charger depuis le serveur

### `useLeaderboardStore`
- `entries` - Leaderboard (top 100)
- `loading` - État de chargement
- `lastFetch` - Timestamp du dernier fetch

**Méthodes:**
- `fetchLeaderboard()` - Charger le classement (cache 5min)
- `invalidateCache()` - Forcer une mise à jour

## Composables

### `useSyncManager()`
Auto-synchronisation automatique (30s par défaut)

```typescript
const { setupSync, startAutoSync, stopAutoSync } = useSyncManager()
setupSync(30000) // 30 secondes
```

### `useExerciseScore()`
Enregistrer un score d'exercice

```typescript
const { submitExerciseScore } = useExerciseScore()

const result = await submitExerciseScore(
  exerciseId,
  moduleId,
  notionId,
  xpGained
)
// { success: true, message: "+30 XP ! 🎉", synced: true }
```

## Architecture Offline-First

1. **L'utilisateur complète un exercice** → XP ajouté **localement** via store
2. **localStorage persiste les données** → Continuité même sans serveur
3. **Auto-sync toutes les 30s** → Envoie vers le serveur en arrière-plan
4. **Leaderboard se recharge** → Cache invalidé après un sync réussi
5. **Si serveur indisponible** → Données restent locales, sync dès que serveur revient

## Progression utilisateur

```
Session 1: 0 XP → 50 XP (Niveau 1)
Session 2: 50 XP → 150 XP (Niveau 2) ⬆️
Session 3: 150 XP → 250 XP (Niveau 3) ⬆️ [Level-up enregistré]
...
Session 101: 9950 XP → 10050 XP (Niveau 101) ⬆️
```

## Usage dans les composants

```vue
<script setup>
import { useUserStore } from '@/stores/useUserStore'
import { useExerciseScore } from '@/composables/useExerciseScore'

const userStore = useUserStore()
const { submitExerciseScore } = useExerciseScore()

async function completeExercise() {
  const result = await submitExerciseScore(
    'exercise-123',
    1,
    '1-1',
    30
  )
  console.log(result.message)
  // Afficher dans l'UI: "+30 XP ! 🎉"
}
</script>

<template>
  <div>
    <p>{{ userStore.pseudo }} - Niveau {{ userStore.currentLevel }}</p>
    <button @click="completeExercise">Valider ✓</button>
  </div>
</template>
```

## Configuration requise

- **Backend**: `bun run server` (port 3000)
- **Frontend**: `npm run dev` (Vite)
- **Desktop**: `bun run tauri dev` (Tauri + Elysia)

## Installation

### 1. Démarrer le serveur
```bash
bun run server
```

### 2. Démarrer l'app Tauri
```bash
bun run tauri dev
```

### 3. Ou en dev web
```bash
bun run dev
```

## Prochaines étapes

- [ ] Configurer Tauri avec SQLite local
- [ ] Intégrer les composables dans ExercisePage.vue
- [ ] Ajouter un formulaire pour changer la pseudo
- [ ] Implémenter un vrai système de streak (jour calendaire)
- [ ] Dashboard utilisateur complet
- [ ] Tests unitaires (stores + API)
