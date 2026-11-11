<template>
  <Transition name="toast">
    <div v-if="show" class="hint-toast">
      <div class="hint-header">
        <span>💡 Indice {{ hintIndex + 1 }}/{{ hints.length }}</span>
        <button class="btn-close-hint" @click="emit('close')">✖</button>
      </div>
      <div class="hint-content" v-html="markup(hints[hintIndex])"></div>
      <div class="hint-actions">
        <button class="btn-nav-hint" @click="emit('prev')" :disabled="hintIndex === 0">← Précédent</button>
        <button class="btn-nav-hint primary" @click="emit('next')" :disabled="hintIndex === hints.length - 1">Suivant →</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { markup } from '@/markup'

defineProps<{
  show: boolean
  hints: string[]
  hintIndex: number
}>()

const emit = defineEmits<{ close: []; prev: []; next: [] }>()
</script>

<style scoped>
.hint-toast { position: absolute; bottom: 20px; left: 2rem; background: white; border: 2px solid #e2e8f0; padding: 1.2rem; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 320px; z-index: 50; }
.hint-header { display: flex; justify-content: space-between; font-weight: 800; color: #f59e0b; margin-bottom: 0.8rem; }
.btn-close-hint { background: none; border: none; color: #94a3b8; cursor: pointer; }
.hint-content { font-size: 0.95rem; color: #334155; margin-bottom: 1rem; line-height: 1.5; }
.hint-content :deep(code) { background: #f1f5f9; padding: 0.1rem 0.3rem; border-radius: 4px; }
.hint-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.btn-nav-hint { flex: 1; background: white; border: 2px solid #e2e8f0; color: #64748b; padding: 0.6rem; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 0 #e2e8f0; transition: all 0.1s; }
.btn-nav-hint:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; transform: translateY(2px); }
.btn-nav-hint.primary:not(:disabled) { background: #f59e0b; border-color: #f59e0b; color: white; box-shadow: 0 3px 0 #d97706; }
.btn-nav-hint:not(:disabled):hover { transform: translateY(-1px); }
.btn-nav-hint:not(:disabled):active { transform: translateY(2px); box-shadow: 0 0 0 transparent; }
</style>
