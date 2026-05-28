<template>
  <div v-if="!appStore.splashComplete" class="splash-screen">
    <div class="splash-content">
      <div class="splash-logo">
        <span class="splash-title">Style<span class="splash-accent">Quest</span></span>
        <div class="splash-subtitle">Apprends le CSS en t'amusant</div>
      </div>

      <div class="splash-progress">
        <div class="progress-bar-container">
          <div
            class="progress-bar-fill"
            :style="{ width: progressWidth + '%' }"
          ></div>
        </div>
        <div class="progress-text">Chargement...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const progressWidth = ref(0)
let animationFrame: number

function animateProgress() {
  if (progressWidth.value < 99.5) {
    progressWidth.value += 1.5
    animationFrame = requestAnimationFrame(animateProgress)
  }
}

onMounted(async () => {
  animateProgress()

  setTimeout(() => {
    progressWidth.value = 100
    setTimeout(() => {
      appStore.completeSplash()
    }, 300)
  }, 1000)
})

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  padding: 2rem;
}

.splash-logo {
  text-align: center;
  animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes pop-in {
  0%   { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.splash-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -2px;
}

.splash-accent {
  color: #1cb0f6; /* Bleu officiel Exercise/Home */
}

.splash-subtitle {
  font-size: 1.125rem;
  color: #64748b;
  margin-top: 0.5rem;
  font-weight: 600;
}

.splash-progress {
  width: 100%;
  max-width: 300px;
}

.progress-bar-container {
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-bar-fill {
  height: 100%;
  background: #1cb0f6;
  border-radius: 999px;
  transition: width 0.1s linear;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #94a3b8;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>