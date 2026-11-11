<template>
  <div class="node-wrapper" :style="{ transform: `translateX(${offsetX}px)` }">
    <div v-if="node.status === 'current'" class="node-tooltip">{{ node.title }}</div>

    <button
      class="node-btn"
      :class="['node-' + node.status]"
      :style="node.status !== 'locked' ? { '--node-bg': node.color, '--node-shadow': node.shadowColor } : {}"
      :disabled="node.status === 'locked'"
      @click="emit('click', node)"
    >
      <span class="node-icon" :class="{ 'icon-locked': node.status === 'locked' }">
        <template v-if="node.isEvaluation">⭐</template>
        <template v-else-if="node.isLesson">📖</template>
        <template v-else>{{ moduleIcon }}</template>
      </span>

      <div v-if="node.status === 'completed'" class="completed-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PathwayNodeData } from '../types'

defineProps<{
  node: PathwayNodeData
  offsetX: number
  moduleIcon: string
}>()

const emit = defineEmits<{ click: [node: PathwayNodeData] }>()
</script>

<style scoped>
.node-wrapper { position: relative; display: flex; flex-direction: column; align-items: center; }
.node-btn { width: 80px; height: 80px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer; position: relative; transition: transform 0.15s, box-shadow 0.15s; background-clip: padding-box; }
.node-icon { display: flex; align-items: center; justify-content: center; }
.icon-locked { filter: grayscale(100%); opacity: 0.4; font-size: 1.8rem; }
.node-completed, .node-current { background-color: var(--node-bg); box-shadow: 0 8px 0 var(--node-shadow); color: white; }
.node-completed:hover, .node-current:hover { transform: translateY(-2px); box-shadow: 0 10px 0 var(--node-shadow); }
.node-completed:active, .node-current:active { transform: translateY(6px); box-shadow: 0 2px 0 var(--node-shadow); }
.node-current::before { content: ''; position: absolute; top: -8px; left: -8px; right: -8px; bottom: -8px; border-radius: 50%; border: 4px solid var(--node-bg); opacity: 0.5; animation: pulse-ring 2s infinite ease-out; pointer-events: none; }
@keyframes pulse-ring {
  0% { transform: scale(0.9); opacity: 0.8; }
  100% { transform: scale(1.3); opacity: 0; }
}
.node-locked { background-color: #e2e8f0; border-color: #cbd5e1; box-shadow: 0 8px 0 #cbd5e1; cursor: not-allowed; }
.completed-badge { position: absolute; bottom: -4px; right: -4px; width: 24px; height: 24px; background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #58cc02; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.node-tooltip { position: absolute; top: -60px; background-color: #ffffff; border: 2px solid #e2e8f0; padding: 0.6rem 1.25rem; border-radius: 14px; font-weight: 800; font-size: 0.95rem; color: #1e293b; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(0,0,0,0.08); animation: float 2s infinite ease-in-out; z-index: 20; }
.node-tooltip::after { content: ''; position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); border-width: 10px 10px 0; border-style: solid; border-color: #e2e8f0 transparent transparent transparent; }
.node-tooltip::before { content: ''; position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); border-width: 8px 8px 0; border-style: solid; border-color: #ffffff transparent transparent transparent; z-index: 1; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>
