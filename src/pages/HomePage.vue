<template>
  <div class="home">

    <!-- ── User Profile ── -->
    <section class="user-section">
      <div class="user-card">
        <div class="user-header">
          <span class="user-pseudo">{{ userStore.pseudo }}</span>
          <span class="user-level">Niveau {{ userStore.currentLevel }}</span>
        </div>
        <div class="user-stats">
          <div class="user-stat">
            <span class="user-stat-label">XP</span>
            <span class="user-stat-value">{{ userStore.totalXP }}</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-label">Streak</span>
            <span class="user-stat-value">{{ userStore.currentStreak }}🔥</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-label">Meilleur</span>
            <span class="user-stat-value">{{ userStore.longestStreak }}🏆</span>
          </div>
        </div>
        <div class="user-xp-bar">
          <div class="xp-bar-fill" :style="{ width: `${((userStore.totalXP % 100) / 100) * 100}%` }"></div>
        </div>
        <span class="xp-text">{{ userStore.totalXP % 100 }}/100 XP vers le prochain niveau</span>
      </div>
    </section>
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
import { onMounted } from 'vue'
import cssData from '../../cssModules.json'
import { useUserStore } from '@/stores/useUserStore'
import { useLeaderboardStore } from '@/stores/useLeaderboardStore'

type Module = typeof cssData[number]

const userStore = useUserStore()
const leaderboardStore = useLeaderboardStore()

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

// Charger le leaderboard au montage
onMounted(() => {
  leaderboardStore.fetchLeaderboard()
})
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

/* User Section */
.user-section {
  margin-top: 1rem;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.user-pseudo {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.user-level {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.user-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
}

.user-stat-label {
  font-size: 0.75rem;
  opacity: 0.8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.user-stat-value {
  font-size: 1.5rem;
  font-weight: 900;
}

.user-xp-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.xp-bar-fill {
  height: 100%;
  background: #ffd700;
  transition: width 0.3s ease;
}

.xp-text {
  font-size: 0.75rem;
  opacity: 0.9;
  display: block;
  text-align: center;
}
</style>
