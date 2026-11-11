<template>
  <header class="ex-topbar">
    <button class="btn-quit" @click="emit('quit')" title="Quitter l'exercice">✖</button>
    <div class="ex-progress">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>
    <div class="ex-streak" :class="{ 'streak-bump': streakAnimating }" title="Série actuelle">
      <span class="fire-icon">🔥</span>
      <span class="streak-count">{{ winstreak }}</span>
      <span v-if="streakAnimating" class="streak-plus-one">+1</span>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  progressPercent: number
  streakAnimating: boolean
  winstreak: number
}>()

const emit = defineEmits<{ quit: [] }>()
</script>

<style scoped>
.ex-topbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: white; border-bottom: 2px solid #e2e8f0; height: 70px; flex-shrink: 0; }
.btn-quit { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.btn-quit:hover { color: #0f172a; }
.ex-progress { flex: 1; max-width: 400px; margin: 0 2rem; }
.progress-bar-bg { width: 100%; height: 14px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: #58cc02; border-radius: 999px; transition: width 0.4s ease; }
.ex-streak { display: flex; align-items: center; gap: 0.4rem; background: white; border: 2px solid #e2e8f0; padding: 0.4rem 0.8rem; border-radius: 12px; font-weight: 900; color: #ff9600; box-shadow: 0 3px 0 #e2e8f0; position: relative; }
.streak-bump { animation: streakPulse 0.5s ease-out; background: #fff8e1; border-color: #ff9600; }
@keyframes streakPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); box-shadow: 0 0 15px rgba(255,150,0,0.4); }
  100% { transform: scale(1); }
}
.fire-icon { font-size: 1.2rem; }
.streak-count { font-size: 1.05rem; }
.streak-plus-one { position: absolute; top: -15px; right: -5px; color: #ff9600; font-weight: 900; font-size: 1.2rem; animation: floatUpFade 1.5s ease-out forwards; pointer-events: none; text-shadow: 0 2px 5px rgba(0,0,0,0.1); }
@keyframes floatUpFade {
  0% { transform: translateY(0) scale(0.8); opacity: 0; }
  20% { transform: translateY(-10px) scale(1.2); opacity: 1; }
  80% { transform: translateY(-25px) scale(1); opacity: 1; }
  100% { transform: translateY(-35px) scale(0.8); opacity: 0; }
}
</style>
