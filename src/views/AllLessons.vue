<template>
  <div class="lessons-page">
    <header class="lessons-top">
      <h1>TOUTES LES LEÇONS</h1>
      <p class="subtitle">Toutes les leçons théoriques, classées par module.</p>
    </header>

    <main class="lessons-grid">
      <div v-for="(notion, idx) in notions" :key="notion.id" class="lesson-card">
        <div class="card-body">
          <h3 class="lesson-title">{{ notion.title }}</h3>
          <p class="lesson-excerpt" v-html="excerpt(notion.explanation)"></p>
        </div>
        <div class="card-actions">
          <RouterLink :to="`/lesson?id=${firstExerciseId(notion)}`" class="btn-ghost">Ouvrir</RouterLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import cssData from '@/data/cssModules.json'
import { computed } from 'vue'

const notions = computed(() => {
  const list: any[] = []
  for (const mod of cssData) {
    for (const n of mod.notions) {
      list.push({ ...n, moduleTitle: mod.title })
    }
  }
  return list
})

function firstExerciseId(notion: any): string {
  return notion.exercises && notion.exercises.length ? notion.exercises[0].id : ''
}

function excerpt(text: string | undefined): string {
  if (!text) return ''
  const plain = text.replace(/\n+/g, ' ').replace(/\*\*(.+?)\*\*/g, '$1')
  return plain.length > 140 ? plain.slice(0, 137) + '…' : plain
}
</script>

<style scoped>
.lessons-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}
.lessons-top h1 { margin: 0; font-size: 1.8rem; font-weight: 900; }
.lessons-top .subtitle { color: #64748b; margin-top: 0.45rem; }

.lessons-grid {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.lesson-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  box-shadow: 0 3px 0 #e2e8f0;
}

.lesson-title { margin: 0 0 0.5rem; font-size: 1.05rem; font-weight: 800; color: #0f172a; }
.lesson-excerpt { margin: 0; color: #475569; font-size: 0.95rem; }

.card-actions { margin-top: 0.9rem; display: flex; justify-content: flex-end; }
.btn-ghost {
  background: #e8f7fe;
  color: #0369a1;
  padding: 0.45rem 0.9rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 800;
}
</style>
