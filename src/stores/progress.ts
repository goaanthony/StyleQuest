import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import cssData from '@/data/cssModules.json'

export const useProgressStore = defineStore('progress', () => {
  // Liste des IDs des exercices complétés venant directement de la BDD
  const completedExercises = ref<string[]>([])

  // 1. Récupération depuis le backend
  async function fetchProgress() {
    const authStore = useAuthStore()
    if (!authStore.token) return

    try {
      const res = await fetch('http://localhost:3000/api/progress', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          // On met à jour notre liste avec les données du serveur
          completedExercises.value = data.completedIds || []
        }
      }
    } catch (e) {
      console.error("Erreur synchro progression", e)
    }
  }

  // 2. Vérifie si un exercice est terminé (utilisé pour les cadenas du parcours)
  function isExerciseCompleted(exerciseId: string): boolean {
    return completedExercises.value.includes(exerciseId)
  }

  // 3. Ajoute un exercice complété localement (la vraie sauvegarde BDD est gérée par ExercisePage)
  function markExerciseComplete(exerciseId: string) {
    if (!completedExercises.value.includes(exerciseId)) {
      completedExercises.value.push(exerciseId)
    }
  }

  // 4. Calcule le % de complétion global (utile pour la page d'accueil ou de profil)
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

  // 5. Réinitialisation lors de la déconnexion
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