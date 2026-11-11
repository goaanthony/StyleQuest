<template>
  <div class="ex-done">
    <div class="done-card">
      <div class="done-stars">
        <span v-for="s in 3" :key="s" class="done-star" :class="{ 'done-star--lit': s <= starRating }">★</span>
      </div>
      <div class="done-trophy">🏆</div>
      <h2 class="done-title">{{ doneTitle }}</h2>
      <p class="done-sub">{{ doneSub }}</p>

      <div class="done-stats">
        <div class="done-stat">
          <span class="done-val">{{ totalXP }}<small> XP</small></span>
          <span class="done-label">Total gagné</span>
        </div>
        <div class="done-stat">
          <span class="done-val" style="color: #ff9600;">🔥 {{ winstreak }}</span>
          <span class="done-label">Série</span>
        </div>
        <div class="done-stat">
          <span class="done-val" style="color: #1cb0f6;">{{ hintsUsed }}</span>
          <span class="done-label">Indices utilisés</span>
        </div>
      </div>

      <div class="done-actions">
        <button class="btn-action btn-continue" style="padding: 1rem 3rem;" @click="emit('continue')">Continuer ➔</button>
        <div class="done-actions-secondary">
          <button class="btn-simple" @click="emit('restart')">Refaire 🔄</button>
          <RouterLink class="btn-simple" to="/pathway">Parcours 🗺️</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  starRating: 1 | 2 | 3
  totalXP: number
  hintsUsed: number
  winstreak: number
}>()

const emit = defineEmits<{
  continue: []
  restart: []
}>()

const doneTitle = computed(() => props.starRating === 3 ? 'Parfait ! 🌟' : 'Terminé ! 💪')
const doneSub = computed(() => props.starRating === 3 ? 'Aucun indice utilisé !' : 'Continue comme ça !')
</script>

<style scoped>
.ex-done { display: flex; align-items: center; justify-content: center; height: 100%; background: #f8fafc; }
.done-card { background: white; border: 2px solid #e2e8f0; border-radius: 24px; padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; box-shadow: 0 8px 0 #e2e8f0; }
.done-stars { display: flex; gap: 0.5rem; font-size: 3rem; color: #e2e8f0; }
.done-star--lit { color: #ffc800; text-shadow: 0 0 20px rgba(255,200,0,0.5); }
.done-trophy { font-size: 5rem; }
.done-title { font-size: 2rem; font-weight: 900; color: #0f172a; margin: 0; }
.done-sub { font-size: 1.1rem; color: #64748b; margin: 0; }
.done-stats { display: flex; gap: 2rem; }
.done-stat { display: flex; flex-direction: column; align-items: center; }
.done-val { font-size: 2rem; font-weight: 900; color: #58cc02; }
.done-label { font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
.done-actions { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; width: 100%; }
.done-actions-secondary { display: flex; gap: 1rem; justify-content: center; }
.btn-action { border: none; border-radius: 16px; font-size: 1.1rem; font-weight: 800; padding: 0.8rem 2.5rem; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: transform 0.1s, box-shadow 0.1s; }
.btn-continue { background: #58cc02; color: white; box-shadow: 0 4px 0 #46a302; }
.btn-continue:active { transform: translateY(2px); box-shadow: 0 2px 0 transparent; }
.btn-simple { padding: 0.8rem 1.5rem; font-weight: 800; text-decoration: none; border-radius: 16px; border: 2px solid #e2e8f0; color: #64748b; box-shadow: 0 3px 0 #e2e8f0; background: white; cursor: pointer; }
.btn-simple:hover { transform: translateY(-1px); box-shadow: 0 4px 0 #e2e8f0; }
.btn-simple:active { transform: translateY(2px); box-shadow: 0 1px 0 #e2e8f0; }
</style>
