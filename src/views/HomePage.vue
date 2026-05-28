<template>
  <div class="home-dashboard">
    <header class="dashboard-header">
      <h1 class="welcome-text">
        Salut, <span class="accent">{{ authStore.user?.username || 'Dev' }}</span> 👋
      </h1>
      <p class="subtitle">Prêt à maîtriser le CSS aujourd'hui ?</p>
    </header>

    <main class="bento-grid">
      
      <div class="bento-card card-resume" :class="{ 'all-done': !nextExerciseInfo }">
        <div class="card-content">
          <div class="resume-badge">{{ nextExerciseInfo?.isLesson ? '📖 Leçon' : '💻 Pratique' }}</div>
          <h2 class="resume-title">{{ nextExerciseInfo ? nextExerciseInfo.title : 'Parcours terminé !' }}</h2>
          <p class="resume-desc">
            {{ nextExerciseInfo ? "Reprends exactement là où tu t'es arrêté." : "Tu as complété tous les modules disponibles." }}
          </p>
        </div>
        <button v-if="nextExerciseInfo" class="btn-main" @click="goResume">
          Continuer ➔
        </button>
        <button v-else class="btn-main btn-done" @click="router.push('/pathway')">
          Revoir le parcours
        </button>
      </div>

      <div class="bento-card widget-card card-streak">
        <div class="widget-icon">🔥</div>
        <div class="widget-info">
          <span class="widget-value">{{ authStore.user?.current_winstreak || 0 }}</span>
          <span class="widget-label">Jours de suite</span>
        </div>
      </div>

      <div class="bento-card widget-card card-xp">
        <div class="widget-icon">⚡</div>
        <div class="widget-info">
          <span class="widget-value">{{ authStore.user?.xp_points || 0 }}</span>
          <span class="widget-label">XP Total</span>
        </div>
      </div>

      <RouterLink to="/pathway" class="bento-card nav-card card-pathway">
        <div class="nav-icon">🗺️</div>
        <h3 class="nav-title">Parcours</h3>
        <p class="nav-sub">Ta carte de progression</p>
      </RouterLink>

      <RouterLink to="/lessons" class="bento-card nav-card card-lessons">
        <div class="nav-icon">📚</div>
        <h3 class="nav-title">Leçons</h3>
        <p class="nav-sub">Toute la théorie</p>
      </RouterLink>

      <RouterLink to="/profile" class="bento-card nav-card card-profile">
        <div class="nav-icon">👤</div>
        <h3 class="nav-title">Profil</h3>
        <p class="nav-sub">Tes statistiques</p>
      </RouterLink>

    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import cssData from '@/data/cssModules.json'

const router = useRouter()
const authStore = useAuthStore()
const progressStore = useProgressStore()

// Cherche le premier exercice NON complété dans la BDD pour le bouton "Reprendre"
const nextExerciseInfo = computed(() => {
  for (const mod of cssData) {
    for (const notion of mod.notions) {
      for (let i = 0; i < notion.exercises.length; i++) {
        const ex = notion.exercises[i]
        if (!progressStore.isExerciseCompleted(ex.id)) {
          return {
            id: ex.id,
            title: notion.title,
            // C'est une leçon si c'est le 1er exercice et que le titre ne contient pas "éval"
            isLesson: i === 0 && !notion.title.toLowerCase().includes('éval') && !notion.title.toLowerCase().includes('eval')
          }
        }
      }
    }
  }
  return null
})

function goResume() {
  const next = nextExerciseInfo.value
  if (next) {
    if (next.isLesson) {
      router.push(`/lesson?id=${next.id}`)
    } else {
      router.push(`/exercises?id=${next.id}`)
    }
  }
}
</script>

<style scoped>
.home-dashboard {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.welcome-text {
  font-family: "DuolingoFeather", sans-serif;
  font-size: 2.5rem;
  font-weight: bold;
  font-palette: --duolingo-blue;
  color: #0f172a;
  margin: 0;
}

.accent { color: #1cb0f6; }

.subtitle {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* --- LA GRILLE BENTO --- */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(140px, auto);
  gap: 1.5rem;
}

.bento-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 0 #e2e8f0;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  text-decoration: none;
  display: flex;
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 0 #cbd5e1;
  border-color: #cbd5e1;
}

/* 1. CARTE GÉANTE (REPRENDRE) */
.card-resume {
  grid-column: 1 / 3; /* Prend 2 colonnes */
  grid-row: 1 / 3;    /* Prend 2 lignes */
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8fafc;
  border-color: #cbd5e1;
  padding: 2.5rem;
}

.card-resume.all-done {
  background: #f0fdf4;
  border-color: #86efac;
}

.resume-badge {
  background: #1cb0f6;
  color: white;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  display: inline-block;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.all-done .resume-badge { background: #22c55e; }

.resume-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.resume-desc {
  font-size: 1.1rem;
  color: #475569;
  margin: 0;
  max-width: 90%;
  line-height: 1.5;
}

.btn-main {
  background: #1cb0f6;
  color: white;
  border: none;
  padding: 1.2rem 2.5rem;
  border-radius: 16px;
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 0 #0284c7;
  transition: transform 0.1s, box-shadow 0.1s;
  align-self: flex-end; /* Aligné en bas à droite */
}

.btn-main:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #0284c7; }
.btn-main:active { transform: translateY(2px); box-shadow: 0 2px 0 #0284c7; }
.btn-done { background: #22c55e; box-shadow: 0 4px 0 #16a34a; }

/* 2 & 3. WIDGETS STATS */
.widget-card {
  align-items: center;
  gap: 1.5rem;
}

.card-streak {
  grid-column: 3;
  grid-row: 1;
}

.card-xp {
  grid-column: 3;
  grid-row: 2;
}

.widget-icon {
  font-size: 3rem;
  background: #f8fafc;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
}

.widget-info {
  display: flex;
  flex-direction: column;
}

.widget-value {
  font-size: 2.2rem;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
}

.widget-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-top: 0.2rem;
}

.card-streak .widget-value { color: #ff9600; }
.card-xp .widget-value { color: #1cb0f6; }

/* 4, 5 & 6. RACCOURCIS NAVIGATION */
.nav-card {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.card-pathway { grid-column: 1; grid-row: 3; }
.card-lessons { grid-column: 2; grid-row: 3; }
.card-profile { grid-column: 3; grid-row: 3; }

.nav-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.nav-title {
  font-size: 1.3rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.nav-sub {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin: 0;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .card-resume { grid-column: 1 / 3; }
  .card-streak { grid-column: 1; grid-row: 3; }
  .card-xp { grid-column: 2; grid-row: 3; }
  .card-pathway { grid-column: 1; grid-row: 4; }
  .card-lessons { grid-column: 2; grid-row: 4; }
  .card-profile { grid-column: 1 / 3; grid-row: 5; } /* Le profil prend toute la largeur en bas */
}

@media (max-width: 600px) {
  .bento-grid { grid-template-columns: 1fr; }
  .card-resume { grid-column: 1; }
  .card-streak, .card-xp, .card-pathway, .card-lessons, .card-profile {
    grid-column: 1;
    grid-row: auto;
  }
  .btn-main { width: 100%; text-align: center; }
}
</style>