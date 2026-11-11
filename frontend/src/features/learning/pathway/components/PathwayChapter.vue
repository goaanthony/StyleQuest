<template>
  <div class="module-section" :id="'chapter-' + index">
    <div class="chapter-header" :style="{ backgroundColor: mod.color, boxShadow: `0 6px 0 ${mod.shadowColor}` }">
      <div class="chapter-icon">{{ mod.icon || '⚡' }}</div>
      <div class="chapter-text">
        <span class="chapter-label">Chapitre {{ index + 1 }}</span>
        <h2 class="chapter-title">{{ mod.title }}</h2>
      </div>
    </div>

    <div class="pathway-container">
      <div class="path-line">
        <div class="path-line-fill" :style="{ height: mod.progressPercentage + '%', backgroundColor: mod.color }"></div>
      </div>

      <div class="nodes-list">
        <PathwayNode
          v-for="(node, nodeIndex) in mod.nodes"
          :key="node.id"
          :node="node"
          :offsetX="Math.sin(nodeIndex * 0.65) * 65"
          :moduleIcon="mod.icon || '⚡'"
          @click="emit('nodeClick', node)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PathwayNode from './PathwayNode.vue'
import type { PathwayNodeData, PathwayModuleData } from '../types'

defineProps<{ mod: PathwayModuleData; index: number }>()
const emit = defineEmits<{ nodeClick: [node: PathwayNodeData] }>()
</script>

<style scoped>
.module-section { display: flex; flex-direction: column; gap: 0; }
.chapter-header { border-radius: 20px; padding: 1.5rem 2rem; color: white; display: flex; align-items: center; gap: 1.25rem; position: relative; z-index: 5; }
.chapter-icon { font-size: 3rem; line-height: 1; }
.chapter-text { display: flex; flex-direction: column; }
.chapter-label { font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9; margin-bottom: 0.2rem; }
.chapter-title { font-size: 1.6rem; font-weight: 900; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.15); line-height: 1.2; }
.pathway-container { position: relative; width: 100%; display: flex; justify-content: center; padding: 5rem 0 4rem; }
.path-line { position: absolute; top: 5rem; bottom: 4rem; left: 50%; width: 16px; margin-left: -8px; background-color: #e2e8f0; border-radius: 999px; z-index: 1; overflow: hidden; }
.path-line-fill { width: 100%; border-radius: 999px; transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.nodes-list { display: flex; flex-direction: column; gap: 3.5rem; position: relative; z-index: 10; align-items: center; width: 100%; }
</style>
