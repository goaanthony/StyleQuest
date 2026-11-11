import { Elysia } from "elysia"
import cssModules from "../../../content/languages/css/curriculum.json"
import { checkExerciseFlexible } from "../learning/css-validation"

interface ExRecord { id: string; targetCSS: string; hints: string[] }
interface Notion    { exercises: ExRecord[] }
interface Module    { notions: Notion[] }

function findExercise(id: string): ExRecord | undefined {
  for (const mod of (cssModules as Module[])) {
    for (const notion of mod.notions) {
      const found = notion.exercises.find(e => e.id === id)
      if (found) return found
    }
  }
}

export const exerciseRoutes = new Elysia()

  .post('/api/exercise/check', ({ body }) => {
    const { exerciseId, userCSS } = body as any
    const exercise = findExercise(exerciseId)

    if (!exercise) {
      return { success: false, message: "Exercice introuvable.", errors: [], warnings: [], tip: "" }
    }

    const result = checkExerciseFlexible(exercise.targetCSS, userCSS)
    return {
      success: result.success,
      message: result.message,
      errors: result.errors,
      warnings: result.warnings,
      tip: result.tip,
    }
  })
