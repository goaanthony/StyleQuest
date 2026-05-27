<template>
  <div class="home">

    <section class="hero">
      <div class="hero-badge">🎮 Apprends le CSS en t'amusant</div>
      <h1 class="hero-title">
        Maîtrise le <span class="hero-accent">CSS</span><br>pas à pas
      </h1>
      <p class="hero-sub">
        Des exercices interactifs, une progression claire et un retour immédiat sur ton code.
        Conçu pour les débutants, structuré pour progresser.
      </p>
      <RouterLink class="btn-simple btn-md" to="/exercises">
        Commencer l'aventure 🚀
      </RouterLink>
    </section>

    <!-- ── Bento UI ── -->
    <section class="bento-grid">
      <div class="bento-large winstreak">
        <div class="w-head">🔥 Série actuelle</div>
        <div class="w-value">{{ streak }} <span class="w-sub">jours</span></div>
        <div class="w-help">Continue ta série pour conserver ton momentum.</div>
      </div>

      <div class="bento-large resume">
        <div class="w-head">Reprendre</div>
        <div class="w-body">
          <p class="resume-label">Dernier exercice non terminé</p>
          <button class="btn-primary cta-resume" @click="goResume">Continuer l'exercice</button>
        </div>
      </div>

      <div class="bento-large theory">
        <div class="w-head">Théorie</div>
        <div class="w-body">
          <p>Accède rapidement à toutes les leçons théoriques.</p>
          <RouterLink to="/lessons" class="btn-simple">Voir les leçons</RouterLink>
        </div>
      </div>

      <div class="bento-small stats">
        <div class="stats-head">Statistiques rapides</div>
        <div class="stats-body">
          <div class="stat-row">
            <strong>{{ accuracy }}%</strong>
            <span>Précision</span>
          </div>
          <RouterLink to="/profile" class="link-small">Voir mon profil</RouterLink>
        </div>
      </div>
    </section>

    <!-- ── Stats ── -->
    <section class="stats-row">
      <div class="stat-card">
        <strong class="stat-val">{{ totalExercises }}</strong>
        <span class="stat-label">Exercices</span>
      </div>
      <div class="stat-card">
        <strong class="stat-val">{{ totalModules }}</strong>
        <span class="stat-label">Modules</span>
      </div>
      <div class="stat-card">
        <strong class="stat-val">{{ totalXP }}</strong>
        <span class="stat-label">XP à gagner</span>
      </div>
      <div class="stat-card">
        <strong class="stat-val">100%</strong>
        <span class="stat-label">Gratuit</span>
      </div>
    </section>

    <!-- ── Modules ── -->
    <section class="modules-section">
      <h2 class="section-title">Programme de cours</h2>
      <div class="modules-grid">
        <div v-for="(mod, i) in modules" :key="mod.id" class="module-card">
          <div class="module-icon">{{ mod.icon }}</div>
          <div class="module-info">
            <span class="module-num">Module {{ i + 1 }}</span>
            <h3 class="module-name">{{ mod.title }}</h3>
            <p class="module-meta">
              {{ countExercises(mod) }} exercices &bull; {{ countXP(mod) }} XP
            </p>
          </div>
          <RouterLink to="/exercises" class="module-cta">Commencer →</RouterLink>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import cssData from '../data/cssModules.json'
import { useProgressStore } from '@/stores/progress'

type Module = typeof cssData[number]

const modules = cssData
const totalModules = cssData.length
const totalExercises = cssData.reduce(
  (acc, m) => acc + m.notions.reduce((a, n) => a + n.exercises.length, 0), 0
)
const totalXP = cssData.reduce(
  (acc, m) => acc + m.notions.reduce(
    (a, n) => a + n.exercises.reduce((b, e) => b + e.xp, 0), 0
  ), 0
)

function countExercises(mod: Module): number {
  return mod.notions.reduce((a, n) => a + n.exercises.length, 0)
}

function countXP(mod: Module): number {
  return mod.notions.reduce((a, n) => a + n.exercises.reduce((b, e) => b + e.xp, 0), 0)
}

// Bento widgets data
const router = useRouter()
const progress = useProgressStore()
progress.loadProgress()

const streak = computed(() => progress.currentStreak)
const accuracy = computed(() => progress.getAccuracyRate())

function findNextExerciseId(): string | null {
  for (const mod of cssData) {
    for (const notion of mod.notions) {
      for (const ex of notion.exercises) {
        if (!progress.isExerciseCompleted(ex.id)) return ex.id
      }
    }
  }
  return null
}

function goResume() {
  const id = findNextExerciseId()
  if (id) router.push(`/exercises?id=${id}`)
  else router.push('/exercises')
}
</script>

<style scoped>
.home {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Hero */
.hero {
  text-align: center;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.hero-badge {
  background: #e8f7fe;
  color: #1cb0f6;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.4rem 1.1rem;
  border-radius: 999px;
  border: 2px solid #bae6fd;
}

.hero-title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.15;
}

.hero-accent { color: #1cb0f6; }

.hero-sub {
  margin: 0;
  max-width: 520px;
  color: #64748b;
  font-size: 1.05rem;
  line-height: 1.7;
}

/* Bento Grid */
.bento-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 0.8fr;
  gap: 1rem;
  align-items: start;
}

.bento-large {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  box-shadow: 0 3px 0 #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.bento-small.stats {
  background: linear-gradient(180deg,#ffffff,#f8fafc);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.w-head { font-weight: 800; color: #0f172a; }
.w-value { font-size: 2.4rem; font-weight: 900; color: #f97316; }
.w-sub { font-size: 0.85rem; font-weight: 700; color: #64748b; }
.w-help { color: #64748b; font-size: 0.95rem; }

.resume .resume-label { font-weight: 700; color: #0f172a; margin-bottom: 0.6rem; }
.cta-resume { width: 100%; }

/* Primary CTA (reused) */
.btn-primary {
  background: #1cb0f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 800;
  padding: 0.7rem 1rem;
  cursor: pointer;
  box-shadow: 0 6px 0 #0284c7;
  transition: transform 0.12s, box-shadow 0.12s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 0 #0284c7; }
.btn-primary:active { transform: translateY(2px); box-shadow: 0 3px 0 #0284c7; }

.cta-resume.btn-primary { display: inline-block; text-align: center; }

.stats-head { font-weight: 800; color: #0f172a; }
.stat-row { display: flex; align-items: baseline; gap: 0.5rem; }
.stat-row strong { font-size: 1.6rem; color: #06b6d4; }
.link-small { font-size: 0.9rem; color: #2563eb; font-weight: 800; text-decoration: none; }

@media (max-width: 900px) {
  .bento-grid { grid-template-columns: 1fr; }
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: 0 2px 0 #e2e8f0;
}

.stat-val {
  font-size: 2rem;
  font-weight: 900;
  color: #1cb0f6;
  line-height: 1;
}

.stat-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Modules */
.section-title {
  margin: 0 0 1.25rem;
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
}

.modules-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.module-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 2px 0 #e2e8f0;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.module-card:hover {
  border-color: #1cb0f6;
  box-shadow: 0 2px 0 #1899d6;
}

.module-icon {
  font-size: 2rem;
  flex-shrink: 0;
  width: 3rem;
  text-align: center;
}

.module-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.module-num {
  font-size: 0.7rem;
  font-weight: 700;
  color: #1cb0f6;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.module-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.module-meta {
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

.module-cta {
  flex-shrink: 0;
  background: #e8f7fe;
  color: #1cb0f6;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.module-cta:hover {
  background: #1cb0f6;
  color: white;
}
</style>
