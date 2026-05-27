import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import cssData from '@/data/cssModules.json'

interface ExerciseProgress {
  exerciseId: string
  completed: boolean
  xpGained: number
  attempts: number
}

interface ModuleProgress {
  moduleId: number
  moduleId: number
  title: string
  icon: string
  notions: {
    notionId: string
    title: string
    completed: boolean
    exercises: ExerciseProgress[]
  }[]
}

export const useProgressStore = defineStore('progress', () => {
  const progressData = ref<Map<string, ExerciseProgress>>(new Map())
  const totalXP = ref(0)
  const lessonsCompleted = ref(0)
  const currentStreak = ref(0)
  const longestStreak = ref(0)

  const lastActiveDate = ref<string>('')

  function loadProgress(): void {
    const saved = localStorage.getItem('stylequest_progress')
    if (saved) {
      const data = JSON.parse(saved)
      progressData.value = new Map(Object.entries(data.progressData || {}))
      totalXP.value = data.totalXP || 0
      lessonsCompleted.value = data.lessonsCompleted || 0
      currentStreak.value = data.currentStreak || 0
      longestStreak.value = data.longestStreak || 0
      lastActiveDate.value = data.lastActiveDate || ''
    }
  }

  function saveProgress(): void {
    const data = {
      progressData: Object.fromEntries(progressData.value),
      totalXP: totalXP.value,
      lessonsCompleted: lessonsCompleted.value,
      currentStreak: currentStreak.value,
      longestStreak: longestStreak.value,
      lastActiveDate: lastActiveDate.value,
    }
    localStorage.setItem('stylequest_progress', JSON.stringify(data))
  }

  function markExerciseComplete(exerciseId: string, xp: number): void {
    if (progressData.value.has(exerciseId)) return

    progressData.value.set(exerciseId, {
      exerciseId,
      completed: true,
      xpGained: xp,
      attempts: 1,
    })

    totalXP.value += xp
    lessonsCompleted.value += 1

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    if (lastActiveDate.value !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastActiveDate.value === yesterdayStr) {
        currentStreak.value += 1
      } else {
        currentStreak.value = 1
      }

      if (currentStreak.value > longestStreak.value) {
        longestStreak.value = currentStreak.value
      }

      lastActiveDate.value = today
    }

    saveProgress()
  }

  function getExerciseProgress(exerciseId: string): ExerciseProgress | undefined {
    return progressData.value.get(exerciseId)
  }

  function isExerciseCompleted(exerciseId: string): boolean {
    return progressData.value.has(exerciseId)
  }

  function getAccuracyRate(): number {
    let total = 0
    let completed = 0
    for (const mod of cssData) {
      for (const notion of mod.notions) {
        for (const ex of notion.exercises) {
          total++
          if (isExerciseCompleted(ex.id)) completed++
        }
      }
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  function resetProgress(): void {
    progressData.value = new Map()
    totalXP.value = 0
    lessonsCompleted.value = 0
    currentStreak.value = 0
    longestStreak.value = 0
    lastActiveDate.value = ''
    saveProgress()
  }

  return {
    progressData,
    totalXP,
    lessonsCompleted,
    currentStreak,
    longestStreak,
    loadProgress,
    saveProgress,
    markExerciseComplete,
    getExerciseProgress,
    isExerciseCompleted,
    getAccuracyRate,
    resetProgress,
  }
})
