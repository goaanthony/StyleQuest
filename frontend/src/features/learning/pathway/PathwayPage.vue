<template>
  <div class="pathway-wrapper">
    <header class="page-topbar">
      <button class="btn-back" @click="router.push('/')">← Retour à l'accueil</button>
    </header>

    <div class="pathway-layout">
      <aside class="toc-sidebar">
        <h3 class="toc-title">Chapitres</h3>
        <ul class="toc-list">
          <li
            v-for="(mod, mIndex) in pathwayModules"
            :key="'toc-' + mod.id"
            class="toc-item"
            @click="scrollToChapter(mIndex)"
          >
            <span class="toc-icon">{{ mod.icon || '⚡' }}</span>
            <span class="toc-text">Ch. {{ mIndex + 1 }}</span>
          </li>
        </ul>
      </aside>

      <div class="pathway-page">
        <div class="page-header">
          <h1 class="page-title">Ton Parcours</h1>
          <p class="page-subtitle">Suis le chemin, complète les niveaux et deviens un maître du CSS.</p>
        </div>

        <div class="modules-container">
          <PathwayChapter
            v-for="(mod, mIndex) in pathwayModules"
            :key="mod.id"
            :mod="mod"
            :index="mIndex"
            @nodeClick="startLevel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '@/features/learning/progress.store'
import cssData from '@content/languages/css/curriculum.json'
import PathwayChapter from './components/PathwayChapter.vue'
import { darkenHex } from './color'
import type { PathwayNodeData, PathwayModuleData, PathwayNodeStatus } from './types'

const router = useRouter()
const progressStore = useProgressStore()

const pathwayModules = computed(() => {
  let foundCurrent = false

  return cssData.map((mod): PathwayModuleData => {
    const nodes: PathwayNodeData[] = []

    let currentOrLastCompletedIndex = 0
    let completedCount = 0

    for (const notion of mod.notions) {
      const isEval = notion.title.toLowerCase().includes('éval') || notion.title.toLowerCase().includes('eval')

      notion.exercises.forEach((ex, exIndex) => {
        const isCompleted = progressStore.isExerciseCompleted(ex.id)
        let status: PathwayNodeStatus = 'locked'

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
        nodes.push({
          id: ex.id, title: notion.title, status,
          isEvaluation: isEval, isLesson: !isEval && exIndex === 0,
          color: baseColor, shadowColor: darkenHex(baseColor),
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
    if (completedCount === 0 && nodes[0]?.status === 'locked') progressPercentage = 0

    return {
      id: mod.id, title: mod.title, color: moduleColor,
      shadowColor: darkenHex(moduleColor), icon: mod.icon,
      nodes, progressPercentage,
    }
  })
})

function startLevel(node: PathwayNodeData) {
  if (node.status === 'locked') return
  if (node.isLesson) {
    router.push(`/lesson?id=${node.id}`)
  } else {
    router.push(`/exercises?id=${node.id}`)
  }
}

function scrollToChapter(index: number) {
  const el = document.getElementById(`chapter-${index}`)
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 90
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.pathway-wrapper { background-color: #f8fafc; min-height: 100vh; }
.page-topbar { position: sticky; top: 0; z-index: 100; background: white; border-bottom: 2px solid #e2e8f0; padding: 1rem 2rem; display: flex; align-items: center; }
.btn-back { background: white; border: 2px solid #e2e8f0; color: #64748b; font-weight: 700; padding: 0.6rem 1.2rem; border-radius: 12px; cursor: pointer; box-shadow: 0 2px 0 #e2e8f0; transition: all 0.1s; }
.btn-back:hover { transform: translateY(-1px); box-shadow: 0 3px 0 #e2e8f0; color: #0f172a; }
.btn-back:active { transform: translateY(2px); box-shadow: 0 0 0 transparent; }
.pathway-layout { position: relative; width: 100%; min-height: 100vh; background-color: #f8fafc; }
.toc-sidebar { position: fixed; left: 2rem; top: 110px; width: 150px; background: white; border: 2px solid #e2e8f0; border-radius: 16px; padding: 1rem 0.75rem; box-shadow: 0 4px 0 #e2e8f0; z-index: 90; }
.toc-title { font-size: 0.8rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.75rem 0; padding-left: 0.5rem; }
.toc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; }
.toc-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.6rem; border-radius: 10px; cursor: pointer; color: #64748b; font-weight: 700; font-size: 0.85rem; transition: all 0.15s ease; }
.toc-item:hover { background: #f1f5f9; color: #0f172a; }
.toc-icon { font-size: 1.1rem; }
.pathway-page { max-width: 600px; margin: 0 auto; padding: 2rem 1.5rem 5rem; display: flex; flex-direction: column; align-items: center; }
.page-header { text-align: center; margin-bottom: 3rem; }
.page-title { font-size: 2.5rem; font-weight: 900; color: #0f172a; margin: 0 0 0.5rem 0; }
.page-subtitle { font-size: 1.1rem; color: #64748b; font-weight: 500; margin: 0; }
.modules-container { width: 100%; display: flex; flex-direction: column; gap: 2rem; }
@media (max-width: 1100px) {
  .toc-sidebar { position: sticky; top: 70px; width: 100%; left: 0; border-radius: 0; border-left: none; border-right: none; padding: 0.5rem 1rem; box-shadow: 0 2px 0 #e2e8f0; }
  .toc-title { display: none; }
  .toc-list { flex-direction: row; overflow-x: auto; gap: 0.5rem; }
  .toc-item { white-space: nowrap; }
}
</style>
