<template>
  <div class="pathway-page">
    <div class="page-header">
      <h1 class="page-title">Ton Parcours</h1>
      <p class="page-subtitle">Suis le chemin, complète les niveaux et deviens un maître du CSS.</p>
    </div>

    <div class="modules-container">
      <div v-for="(mod, mIndex) in pathwayModules" :key="mod.id" class="module-section">
        
        <div class="chapter-header" :style="{ backgroundColor: mod.color, boxShadow: `0 6px 0 ${mod.shadowColor}` }">
          <div class="chapter-icon">{{ mod.icon || '⚡' }}</div>
          <div class="chapter-text">
            <span class="chapter-label">Chapitre {{ mIndex + 1 }}</span>
            <h2 class="chapter-title">{{ mod.title }}</h2>
          </div>
        </div>

        <div class="pathway-container">
          <div class="path-line">
            <div 
              class="path-line-fill" 
              :style="{ height: mod.progressPercentage + '%', backgroundColor: mod.color }"
            ></div>
          </div>

          <div class="nodes-list">
            <div
              v-for="(node, index) in mod.nodes"
              :key="node.id"
              class="node-wrapper"
              :style="{ transform: `translateX(${Math.sin(index * 0.65) * 65}px)` }"
            >
              <div v-if="node.status === 'current'" class="node-tooltip">
                {{ node.title }}
              </div>

              <button
                class="node-btn"
                :class="['node-' + node.status]"
                :style="node.status !== 'locked' ? {
                  '--node-bg': node.color,
                  '--node-shadow': node.shadowColor
                } : {}"
                :disabled="node.status === 'locked'"
                @click="startLevel(node)"
              >
                <span class="node-icon" :class="{ 'icon-locked': node.status === 'locked' }">
                  <template v-if="node.isEvaluation">⭐</template>
                  <template v-else-if="node.isLesson">📖</template>
                  <template v-else>{{ mod.icon || '⚡' }}</template>
                </span>

                <div v-if="node.status === 'completed'" class="completed-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '@/stores/progress'
import cssData from '@/data/cssModules.json'

const router = useRouter()
const progressStore = useProgressStore()

function darkenHex(hex: string) {
  if (!hex) return '#cbd5e1'
  let color = hex.replace('#', '')
  if (color.length === 3) color = color.split('').map(x => x + x).join('')
  
  let r = parseInt(color.substring(0, 2), 16)
  let g = parseInt(color.substring(2, 4), 16)
  let b = parseInt(color.substring(4, 6), 16)

  r = Math.floor(r * 0.75)
  g = Math.floor(g * 0.75)
  b = Math.floor(b * 0.75)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const pathwayModules = computed(() => {
  let foundCurrent = false

  return cssData.map(mod => {
    const nodes = []
    let currentOrLastCompletedIndex = 0
    let completedCount = 0

    for (const notion of mod.notions) {
      const isEval = notion.title.toLowerCase().includes('éval') || notion.title.toLowerCase().includes('eval')

      // On boucle sur chaque exercice de la notion en gardant son index
      notion.exercises.forEach((ex, exIndex) => {
        const isCompleted = progressStore.isExerciseCompleted(ex.id)
        let status = 'locked'

        if (isCompleted) {
          status = 'completed'
          completedCount++
          currentOrLastCompletedIndex = nodes.length
        } else if (!foundCurrent) {
          status = 'current'
          foundCurrent = true
          currentOrLastCompletedIndex = nodes.length
        }

        const baseColor = isEval ? '#ffc800' : (mod.color || '#1cb0f6')
        
        // C'est une leçon SEULEMENT si c'est le 1er exercice de la notion (et que ce n'est pas une éval)
        const isLesson = !isEval && exIndex === 0

        nodes.push({
          id: ex.id,
          title: notion.title,
          status,
          isEvaluation: isEval,
          isLesson: isLesson,
          color: baseColor,
          shadowColor: darkenHex(baseColor)
        })
      })
    }

    const moduleColor = mod.color || '#1cb0f6'

    let progressPercentage = 0
    if (nodes.length > 1) {
      progressPercentage = (currentOrLastCompletedIndex / (nodes.length - 1)) * 100
    } else if (nodes.length === 1 && completedCount === 1) {
      progressPercentage = 100
    }

    if (completedCount === 0 && nodes[0]?.status === 'locked') {
      progressPercentage = 0
    }

    return {
      id: mod.id,
      title: mod.title,
      color: moduleColor,
      shadowColor: darkenHex(moduleColor),
      icon: mod.icon,
      nodes,
      progressPercentage
    }
  })
})

function startLevel(node: any) {
  if (node.status === 'locked') return
  
  if (node.isLesson) {
    router.push(`/lesson?id=${node.id}`)
  } else {
    router.push(`/exercises?id=${node.id}`)
  }
}
</script>

<style scoped>
.pathway-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

.modules-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem; 
}

.chapter-header {
  border-radius: 20px;
  padding: 1.5rem 2rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  z-index: 5; 
}

.chapter-icon {
  font-size: 3rem;
  line-height: 1;
}

.chapter-text {
  display: flex;
  flex-direction: column;
}

.chapter-label {
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.9;
  margin-bottom: 0.2rem;
}

.chapter-title {
  font-size: 1.6rem;
  font-weight: 900;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  line-height: 1.2;
}

.pathway-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 5rem 0 4rem 0; 
}

.path-line {
  position: absolute;
  top: 5rem; 
  bottom: 4rem; 
  left: 50%;
  width: 16px;
  margin-left: -8px;
  background-color: #e2e8f0;
  border-radius: 999px;
  z-index: 1;
  overflow: hidden;
}

.path-line-fill {
  width: 100%;
  border-radius: 999px;
  transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  position: relative;
  z-index: 10; 
  align-items: center;
  width: 100%;
}

.node-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  position: relative;
  transition: transform 0.15s, box-shadow 0.15s;
  background-clip: padding-box;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-locked {
  filter: grayscale(100%);
  opacity: 0.4;
  font-size: 1.8rem;
}

.node-completed, .node-current {
  background-color: var(--node-bg);
  box-shadow: 0 8px 0 var(--node-shadow);
  color: white;
}

.node-completed:hover, .node-current:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 0 var(--node-shadow);
}

.node-completed:active, .node-current:active {
  transform: translateY(6px);
  box-shadow: 0 2px 0 var(--node-shadow);
}

.node-current::before {
  content: '';
  position: absolute;
  top: -8px; left: -8px; right: -8px; bottom: -8px;
  border-radius: 50%;
  border: 4px solid var(--node-bg);
  opacity: 0.5;
  animation: pulse-ring 2s infinite ease-out;
  pointer-events: none;
}

@keyframes pulse-ring {
  0% { transform: scale(0.9); opacity: 0.8; }
  100% { transform: scale(1.3); opacity: 0; }
}

.node-locked {
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  box-shadow: 0 8px 0 #cbd5e1;
  cursor: not-allowed;
}

/* Badge pour indiquer que c'est terminé (sans écraser l'icône) */
.completed-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background-color: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #58cc02;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.node-tooltip {
  position: absolute;
  top: -60px;
  background-color: #ffffff;
  border: 2px solid #e2e8f0;
  padding: 0.6rem 1.25rem;
  border-radius: 14px;
  font-weight: 800;
  font-size: 0.95rem;
  color: #1e293b;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: float 2s infinite ease-in-out;
  z-index: 20; 
}

.node-tooltip::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: #e2e8f0 transparent transparent transparent;
}

.node-tooltip::before {
  content: '';
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px 8px 0;
  border-style: solid;
  border-color: #ffffff transparent transparent transparent;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>