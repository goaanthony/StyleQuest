<template>
  <footer class="ex-bottombar" :class="bottomBarClass">
    <div class="bottombar-content">
      <div class="bar-left">
        <button v-if="!feedback" class="btn-hint" @click="emit('hint')">💡 Indice</button>
        <div v-if="feedback" class="feedback-msg">
          <div class="feedback-icon">{{ feedback.success ? '✅' : '❌' }}</div>
          <div class="feedback-text">
            <strong class="feedback-title">{{ feedback.message }}</strong>
            <p v-if="feedback.errors && feedback.errors.length" class="feedback-error-desc">{{ feedback.errors[0] }}</p>
          </div>
        </div>
      </div>

      <div class="bar-right">
        <button v-if="!feedback" class="btn-action btn-verify" @click="emit('verify')" :disabled="!userCSS.trim() || checking">
          <span v-if="checking">...</span><span v-else>Vérifier</span>
        </button>
        <button v-else-if="feedback.success" class="btn-action btn-continue" @click="emit('continue')">Continuer</button>
        <button v-else class="btn-action btn-retry" @click="emit('retry')">Réessayer</button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Feedback { success: boolean; message: string; errors: string[] }

const props = defineProps<{
  feedback: Feedback | null
  checking: boolean
  userCSS: string
}>()

const emit = defineEmits<{ hint: []; verify: []; continue: []; retry: [] }>()

const bottomBarClass = computed(() => {
  if (!props.feedback) return ''
  return props.feedback.success ? 'bar--success' : 'bar--error'
})
</script>

<style scoped>
.ex-bottombar { background: white; border-top: 2px solid #e2e8f0; padding: 1.5rem 2rem; height: 100px; flex-shrink: 0; transition: background 0.2s, border-color 0.2s; }
.bottombar-content { max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; height: 100%; }
.bar-left { display: flex; align-items: center; gap: 1rem; }
.bar-right { display: flex; align-items: center; }
.bar--success { background: #d7ffb8; border-color: #58cc02; }
.bar--error { background: #ffdfe0; border-color: #ff4b4b; }
.feedback-msg { display: flex; align-items: center; gap: 1rem; }
.feedback-icon { width: 50px; height: 50px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.feedback-text { display: flex; flex-direction: column; }
.feedback-title { font-size: 1.4rem; font-weight: 900; }
.bar--success .feedback-title { color: #46a302; }
.bar--error .feedback-title { color: #ea2b2b; }
.feedback-error-desc { margin: 0; font-size: 0.95rem; color: #ea2b2b; font-weight: 600; }
.btn-hint { background: white; border: 2px solid #e2e8f0; color: #64748b; font-weight: 800; padding: 0.8rem 1.5rem; border-radius: 16px; cursor: pointer; box-shadow: 0 2px 0 #e2e8f0; }
.btn-hint:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-action { border: none; border-radius: 16px; font-size: 1.1rem; font-weight: 800; padding: 0.8rem 2.5rem; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: transform 0.1s, box-shadow 0.1s; }
.btn-verify { background: #58cc02; color: white; box-shadow: 0 4px 0 #46a302; }
.btn-verify:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 0 #46a302; }
.btn-verify:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 2px 0 #46a302; }
.btn-verify:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: 0 4px 0 #cbd5e1; cursor: not-allowed; }
.btn-continue { background: #58cc02; color: white; box-shadow: 0 4px 0 #46a302; }
.btn-retry { background: #ff4b4b; color: white; box-shadow: 0 4px 0 #ea2b2b; }
.btn-continue:active, .btn-retry:active { transform: translateY(2px); box-shadow: 0 2px 0 transparent; }
</style>
