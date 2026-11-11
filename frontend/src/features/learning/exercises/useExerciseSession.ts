import { computed, ref } from 'vue'
import { useAuthStore } from '@/features/auth/auth.store'
import { useProgressStore } from '@/features/learning/progress.store'
import { API_BASE } from '@/api'
import cssData from '@content/languages/css/curriculum.json'

export interface FlatExercise {
  id: string
  objective: string
  xp: number
  hints: string[]
  html: string
  targetCSS: string
  starterCSS: string
  moduleId: number
  notionId: string
  notionTitle: string
}

interface Feedback {
  success: boolean
  message: string
  errors: string[]
}

export function useExerciseSession(exerciseId: string) {
  const authStore = useAuthStore()
  const progressStore = useProgressStore()
  const exercises: FlatExercise[] = []

  for (const mod of cssData) {
    for (const notion of mod.notions) {
      for (const exercise of notion.exercises) {
        exercises.push({
          id: exercise.id,
          objective: exercise.objective,
          xp: exercise.xp,
          hints: exercise.hints,
          html: exercise.html,
          targetCSS: exercise.targetCSS,
          starterCSS: exercise.starterCSS,
          moduleId: mod.id,
          notionId: notion.id,
          notionTitle: notion.title,
        })
      }
    }
  }

  const initialIndex = exercises.findIndex((exercise) => exercise.id === exerciseId)
  const currentIndex = ref(initialIndex !== -1 ? initialIndex : 0)
  const currentExercise = computed(() => exercises[currentIndex.value])
  const userCSS = ref(currentExercise.value?.starterCSS ?? '')
  const feedback = ref<Feedback | null>(null)
  const showHint = ref(false)
  const hintIndex = ref(0)
  const totalXP = ref(0)
  const completed = ref(false)
  const checking = ref(false)
  const showXPGain = ref(false)
  const lastXPGain = ref(0)
  const hintsUsed = ref(0)
  const revealedHints = ref(new Set<number>())
  const streakAnimating = ref(false)

  const progressPercent = computed(() => {
    const notionExercises = exercises.filter(
      (exercise) => exercise.notionId === currentExercise.value.notionId,
    )
    const localIndex = notionExercises.findIndex(
      (exercise) => exercise.id === currentExercise.value.id,
    )
    return (localIndex / notionExercises.length) * 100
  })

  const starRating = computed<1 | 2 | 3>(() => {
    if (hintsUsed.value === 0) return 3
    if (hintsUsed.value === 1) return 2
    return 1
  })

  const nextNotionExercise = computed(() =>
    exercises.find(
      (exercise, index) =>
        index > currentIndex.value && exercise.notionId !== currentExercise.value.notionId,
    ),
  )

  function setUserCSS(value: string) {
    userCSS.value = value
    feedback.value = null
  }

  function clearFeedback() {
    feedback.value = null
  }

  function isChallenge(exercise: FlatExercise) {
    return exercise.objective.toUpperCase().includes('CHALLENGE')
  }

  function triggerStreakAnimation() {
    streakAnimating.value = true
    setTimeout(() => {
      streakAnimating.value = false
    }, 1500)
  }

  async function syncProgressWithDB(xpGained: number) {
    try {
      const response = await fetch(`${API_BASE}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          exerciseId: currentExercise.value.id,
          moduleId: currentExercise.value.moduleId,
          notionId: currentExercise.value.notionId,
          xpGained,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user && authStore.user) {
          const oldStreak = authStore.user.current_winstreak || 0
          authStore.updateUser(data.user)
          if (data.user.current_winstreak > oldStreak) triggerStreakAnimation()
        }
      }
    } catch (error) {
      console.error('syncProgressWithDB:', error)
    }
  }

  async function checkAnswer() {
    if (!userCSS.value.trim() || checking.value) return

    checking.value = true
    try {
      const response = await fetch(`${API_BASE}/exercise/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: currentExercise.value.id,
          userCSS: userCSS.value,
        }),
      })
      const result = (await response.json()) as Feedback
      feedback.value = result

      if (result.success) {
        await syncProgressWithDB(currentExercise.value.xp)
        totalXP.value += currentExercise.value.xp
        lastXPGain.value = currentExercise.value.xp
        progressStore.markExerciseComplete(currentExercise.value.id)
        showXPGain.value = true
        setTimeout(() => {
          showXPGain.value = false
        }, 1500)
      }
    } catch (error) {
      console.error(error)
    } finally {
      checking.value = false
    }
  }

  function nextExercise() {
    feedback.value = null
    showHint.value = false
    hintIndex.value = 0
    revealedHints.value.clear()

    const nextIndex = currentIndex.value + 1
    if (
      nextIndex < exercises.length &&
      exercises[nextIndex].notionId === currentExercise.value.notionId
    ) {
      currentIndex.value = nextIndex
      userCSS.value = currentExercise.value.starterCSS
      return true
    }

    completed.value = true
    return false
  }

  function toggleHint() {
    showHint.value = !showHint.value
    if (showHint.value && !revealedHints.value.has(0)) {
      revealedHints.value.add(0)
      hintsUsed.value++
    }
  }

  function revealNextHint() {
    if (hintIndex.value < currentExercise.value.hints.length - 1) {
      hintIndex.value++
      if (!revealedHints.value.has(hintIndex.value)) {
        revealedHints.value.add(hintIndex.value)
        hintsUsed.value++
      }
    }
  }

  function revealPrevHint() {
    if (hintIndex.value > 0) hintIndex.value--
  }

  function resetCode() {
    userCSS.value = currentExercise.value.starterCSS
    feedback.value = null
  }

  function restart() {
    completed.value = false
    totalXP.value = 0
    hintsUsed.value = 0
    revealedHints.value.clear()
    userCSS.value = currentExercise.value.starterCSS
  }

  return {
    currentExercise,
    userCSS,
    feedback,
    showHint,
    hintIndex,
    totalXP,
    completed,
    checking,
    showXPGain,
    lastXPGain,
    hintsUsed,
    streakAnimating,
    progressPercent,
    starRating,
    nextNotionExercise,
    setUserCSS,
    clearFeedback,
    isChallenge,
    checkAnswer,
    nextExercise,
    toggleHint,
    revealNextHint,
    revealPrevHint,
    resetCode,
    restart,
  }
}
