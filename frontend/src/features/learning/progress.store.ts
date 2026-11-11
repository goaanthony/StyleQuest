import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/features/auth/auth.store'
import { API_BASE } from '@/api'
import cssData from '@content/languages/css/curriculum.json'

export const useProgressStore = defineStore('progress', () => {
  const completedExercises = ref<string[]>([])

  async function fetchProgress() {
    const authStore = useAuthStore()
    if (!authStore.token) return
    try {
      const res = await fetch(`${API_BASE}/progress`, {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) completedExercises.value = data.completedIds || []
      }
    } catch (e) {
      console.error('fetchProgress:', e)
    }
  }

  function isExerciseCompleted(exerciseId: string): boolean {
    return completedExercises.value.includes(exerciseId)
  }

  function markExerciseComplete(exerciseId: string) {
    if (!completedExercises.value.includes(exerciseId)) {
      completedExercises.value.push(exerciseId)
    }
  }

  function getAccuracyRate(): number {
    let total = 0
    for (const mod of cssData) {
      for (const notion of mod.notions) {
        total += notion.exercises.length
      }
    }
    const completed = completedExercises.value.length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  function resetProgress(): void {
    completedExercises.value = []
  }

  return {
    completedExercises,
    fetchProgress,
    isExerciseCompleted,
    markExerciseComplete,
    getAccuracyRate,
    resetProgress,
  }
})
