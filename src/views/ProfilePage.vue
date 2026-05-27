<template>
  <div class="profile-container">
    <div class="profile-header">
      <button class="back-btn" @click="goBack" aria-label="Retour">
        ← Retour
      </button>
      <h1 class="page-title">Profil de <span class="title-accent">{{ authStore.user?.username || 'Joueur' }}</span></h1>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <div class="profile-avatar">
          <div class="avatar-circle">
            {{ userInitials }}
          </div>
        </div>
        
        <div class="profile-info">
          <h2 class="username">{{ authStore.user?.username || 'Joueur' }}</h2>
          <p class="member-since">
            Inscrit le {{ formatDate(authStore.user?.created_at) }}
          </p>
        </div>

        <button class="btn-logout" @click="handleLogout">
          Déconnexion
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-val" style="color: #ff9600;">{{ authStore.user?.current_winstreak || 0 }}</div>
          <div class="stat-label">Série 🔥</div>
        </div>

        <div class="stat-card">
          <div class="stat-val" style="color: #fbbf24;">{{ authStore.user?.longest_winstreak || 0 }}</div>
          <div class="stat-label">Record 🏆</div>
        </div>

        <div class="stat-card">
          <div class="stat-val" style="color: #1cb0f6;">{{ progressStore.lessonsCompleted || 0 }}</div>
          <div class="stat-label">Leçons 📚</div>
        </div>

        <div class="stat-card">
          <div class="stat-val" style="color: #58cc02;">{{ authStore.user?.xp_points || 0 }}</div>
          <div class="stat-label">XP ⚡</div>
        </div>
      </div>

      <div class="section-card">
        <h3 class="section-title">Ta progression</h3>
        
        <div class="progress-overview">
          <div class="progress-item">
            <div class="progress-info">
              <span class="progress-label">Précision globale</span>
              <span class="progress-value" style="color: #1cb0f6;">{{ progressStore.getAccuracyRate() }}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="background: #1cb0f6;" :style="{ width: progressStore.getAccuracyRate() + '%' }"></div>
            </div>
          </div>

          <div class="progress-item">
            <div class="progress-info">
              <span class="progress-label">Avancement du cours</span>
              <span class="progress-value" style="color: #58cc02;">{{ Math.round(progressPercent) }}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="background: #58cc02;" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <h3 class="section-title">Activité Récente</h3>
        
        <div class="activity-list">
          <div v-if="recentActivity.length === 0" class="empty-activity">
            <p>Tu n'as rien fait récemment.</p>
            <button class="btn-primary-sm" @click="router.push('/exercises')">
              Faire un exercice
            </button>
          </div>
          
          <div v-else v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon" :style="{ background: activity.type === 'exercise' ? '#e8f7fe' : '#f0fdf4', color: activity.type === 'exercise' ? '#1cb0f6' : '#58cc02' }">
              {{ activity.type === 'exercise' ? '✅' : '📚' }}
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.description }}</p>
              <p class="activity-time">{{ formatTimeAgo(activity.timestamp) }}</p>
            </div>
            <div v-if="activity.xp" class="activity-xp">
              +{{ activity.xp }} XP
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import cssData from '@/data/cssModules.json'

type ActivityItem = {
  id: string
  type: 'exercise' | 'lesson'
  description: string
  timestamp: string
  xp?: number
}

const router = useRouter()
const authStore = useAuthStore()
const progressStore = useProgressStore()

const recentActivity = ref<ActivityItem[]>([])

const userInitials = computed(() => {
  if (!authStore.user?.username) return '?'
  return authStore.user.username.slice(0, 2).toUpperCase()
})

const totalExercisesCount = computed(() => {
  return cssData.reduce((acc, mod) => 
    acc + mod.notions.reduce((a, n) => a + n.exercises.length, 0)
  , 0)
})

const progressPercent = computed(() => {
  if (totalExercisesCount.value === 0) return 0
  return (progressStore.lessonsCompleted / totalExercisesCount.value) * 100
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

function formatTimeAgo(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours} h`
  if (diffDays < 7) return `Il y a ${diffDays} j`
  return formatDate(timestamp)
}

function goBack() {
  router.push('/')
}

function handleLogout() {
  authStore.logout()
  router.push('/auth')
}

function generateRecentActivity() {
  const activities: ActivityItem[] = []
  const completedExercises = Array.from(progressStore.progressData.values())
  
  if (completedExercises.length > 0) {
    const lastEx = completedExercises[completedExercises.length - 1]
    activities.push({
      id: '1',
      type: 'exercise',
      description: `Exercice terminé`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      xp: lastEx.xpGained || 10
    })
  }
  
  if (completedExercises.length > 1) {
    activities.push({
      id: '2',
      type: 'lesson',
      description: 'Nouvelle leçon apprise',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    })
  }

  recentActivity.value = activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5)
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth')
    return
  }
  generateRecentActivity()
})
</script>

<style scoped>
.profile-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-btn {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  font-weight: 800;
  color: #64748b;
  cursor: pointer;
  box-shadow: 0 3px 0 #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: transform 0.1s, box-shadow 0.1s;
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 0 #e2e8f0;
}

.page-title {
  font-size: 2rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.title-accent {
  color: #1cb0f6;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
}

/* Cartes communes (Style Home/Ex) */
.profile-card, .section-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 0 #e2e8f0;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-circle {
  width: 72px;
  height: 72px;
  background: #e8f7fe;
  border: 2px solid #bae6fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 900;
  color: #1cb0f6;
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 1.6rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.member-since {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}

.btn-logout {
  background: white;
  color: #ff4b4b;
  border: 2px solid #ff4b4b;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 3px 0 #ff4b4b;
  transition: transform 0.1s;
}

.btn-logout:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 0 #ff4b4b;
}

.btn-logout:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 #ff4b4b;
}

/* Grille de stats (Style Home) */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .profile-card { flex-direction: column; text-align: center; }
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
  line-height: 1;
}

.stat-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-title {
  margin: 0 0 1.25rem;
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
}

/* Barres de progression */
.progress-overview {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-weight: 800;
  color: #1e293b;
  font-size: 0.95rem;
}

.progress-value {
  font-weight: 900;
  font-size: 1.1rem;
}

.progress-bar-bg {
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Activité */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-activity {
  text-align: center;
  color: #64748b;
  font-weight: 600;
  padding: 1rem;
}

.btn-primary-sm {
  background: #1cb0f6;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 3px 0 #0284c7;
  margin-top: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
}

.activity-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.2rem 0;
  font-size: 0.95rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
  font-weight: 600;
}

.activity-xp {
  background: rgba(88,204,2,0.15);
  color: #58cc02;
  border: 1.5px solid rgba(88,204,2,0.3);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}
</style>