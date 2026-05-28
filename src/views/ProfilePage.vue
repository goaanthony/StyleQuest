<template>
  <div class="profile-wrapper">
    <header class="page-topbar">
      <button class="btn-back" @click="router.push('/')">← Retour à l'accueil</button>
    </header>

    <main class="profile-dashboard">
      <div class="page-header">
        <h1 class="page-title">Ton Profil</h1>
        <p class="page-subtitle">Suis tes statistiques et ton évolution.</p>
      </div>

      <div class="bento-grid">
        
        <div class="bento-card card-identity">
          <div class="identity-info">
            <div class="avatar-circle">
              {{ userInitials }}
            </div>
            <div class="user-details">
              <h2 class="username">{{ authStore.user?.username || 'Joueur' }}</h2>
              <p class="member-since">Membre depuis le {{ formatDate(authStore.user?.created_at) }}</p>
            </div>
          </div>
          <button class="btn-logout" @click="handleLogout">
            Déconnexion
          </button>
        </div>

        <div class="bento-card widget-card">
          <div class="widget-icon streak-icon">🔥</div>
          <div class="widget-info">
            <span class="widget-value streak-val">{{ authStore.user?.current_winstreak || 0 }}</span>
            <span class="widget-label">Série Actuelle</span>
          </div>
        </div>

        <div class="bento-card widget-card">
          <div class="widget-icon record-icon">🏆</div>
          <div class="widget-info">
            <span class="widget-value record-val">{{ authStore.user?.longest_winstreak || 0 }}</span>
            <span class="widget-label">Record Série</span>
          </div>
        </div>

        <div class="bento-card widget-card">
          <div class="widget-icon xp-icon">⚡</div>
          <div class="widget-info">
            <span class="widget-value xp-val">{{ authStore.user?.xp_points || 0 }}</span>
            <span class="widget-label">XP Total</span>
          </div>
        </div>

        <div class="bento-card widget-card">
          <div class="widget-icon lesson-icon">✅</div>
          <div class="widget-info">
            <span class="widget-value lesson-val">{{ progressStore.completedExercises.length }}</span>
            <span class="widget-label">Niveaux Finis</span>
          </div>
        </div>

        <div class="bento-card card-progress">
          <h3 class="card-title">Avancement du cours</h3>
          
          <div class="progress-item">
            <div class="progress-info">
              <span class="progress-label">Complétion globale</span>
              <span class="progress-value" style="color: #58cc02;">{{ Math.round(progressPercent) }}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="background: #58cc02;" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import cssData from '@/data/cssModules.json'

const router = useRouter()
const authStore = useAuthStore()
const progressStore = useProgressStore()

// Initiales de l'utilisateur
const userInitials = computed(() => {
  if (!authStore.user?.username) return '?'
  return authStore.user.username.slice(0, 2).toUpperCase()
})

// Calcul dynamique du pourcentage de complétion en fonction du JSON et de la DB
const totalExercisesCount = computed(() => {
  return cssData.reduce((acc, mod) => 
    acc + mod.notions.reduce((a, n) => a + n.exercises.length, 0)
  , 0)
})

const progressPercent = computed(() => {
  if (totalExercisesCount.value === 0) return 0
  return (progressStore.completedExercises.length / totalExercisesCount.value) * 100
})

function formatDate(dateString?: string) {
  if (!dateString) return 'Aujourd\'hui'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', month: 'long', day: 'numeric'
    })
  } catch {
    return 'Aujourd\'hui'
  }
}

function handleLogout() {
  authStore.logout()
  progressStore.resetProgress() // On vide la progression locale pour le prochain utilisateur
  router.push('/auth')
}

// Redirection sécurité si l'utilisateur arrive ici déconnecté
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth')
  }
})
</script>

<style scoped>
.profile-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
}

/* --- HEADER DE RETOUR --- */
.page-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 2px solid #e2e8f0;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
}

.btn-back {
  background: white;
  border: 2px solid #e2e8f0;
  color: #64748b;
  font-weight: 700;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 2px 0 #e2e8f0;
  transition: all 0.1s;
}

.btn-back:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 0 #e2e8f0;
  color: #0f172a;
}

.btn-back:active {
  transform: translateY(2px);
  box-shadow: 0 0 0 transparent;
}

/* --- DASHBOARD PROFIL --- */
.profile-dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* --- BENTO GRID --- */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.bento-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 0 #e2e8f0;
  display: flex;
}

/* CARTE IDENTITÉ */
.card-identity {
  grid-column: span 4;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
}

.identity-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: #e8f7fe;
  border: 2px solid #bae6fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 900;
  color: #1cb0f6;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.username {
  font-size: 1.8rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  line-height: 1;
}

.member-since {
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
}

.btn-logout {
  background: white;
  color: #ff4b4b;
  border: 2px solid #ff4b4b;
  border-radius: 14px;
  padding: 0.8rem 1.5rem;
  font-weight: 800;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 4px 0 #ff4b4b;
  transition: transform 0.1s;
}

.btn-logout:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #ff4b4b; }
.btn-logout:active { transform: translateY(2px); box-shadow: 0 2px 0 #ff4b4b; }

/* WIDGETS STATS */
.widget-card {
  grid-column: span 1;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.widget-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
}

.widget-info {
  display: flex;
  flex-direction: column;
}

.widget-value {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}

.widget-label {
  font-size: 0.8rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  margin-top: 0.4rem;
  letter-spacing: 0.05em;
}

/* Couleurs spécifiques aux stats */
.streak-icon { background: #fff8e1; border-color: #ffe082; }
.streak-val { color: #ff9600; }

.record-icon { background: #fef3c7; border-color: #fde68a; }
.record-val { color: #fbbf24; }

.xp-icon { background: #e8f7fe; border-color: #bae6fd; }
.xp-val { color: #1cb0f6; }

.lesson-icon { background: #f0fdf4; border-color: #bbf7d0; }
.lesson-val { color: #58cc02; }

/* CARTE PROGRESSION */
.card-progress {
  grid-column: span 4;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
}

.card-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-weight: 800;
  color: #1e293b;
  font-size: 1.05rem;
}

.progress-value {
  font-weight: 900;
  font-size: 1.2rem;
}

.progress-bar-bg {
  width: 100%;
  height: 16px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .widget-card { grid-column: span 2; }
}

@media (max-width: 600px) {
  .card-identity {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  .identity-info {
    flex-direction: column;
  }
  .btn-logout { width: 100%; }
}
</style>