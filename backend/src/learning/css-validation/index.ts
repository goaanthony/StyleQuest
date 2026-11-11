import type { ExerciseCheckResult } from "./types"
import { compareNormalizedCSS } from "./comparator"

export * from "./types"
export * from "./units"
export * from "./parser"
export * from "./comparator"

/**
 * Fonction principale de vérification d'un exercice CSS avec analyse flexible
 */
export function checkExerciseFlexible(
  targetCSS: string,
  userCSS: string,
  options: { flexibleFonts?: boolean } = {}
): ExerciseCheckResult {
  const { flexibleFonts = false } = options
  const result = compareNormalizedCSS(targetCSS, userCSS, flexibleFonts)

  if (result.success) {
    return {
      success: true,
      message: "🎉 Parfait ! Beau travail !",
      errors: [],
      warnings: result.warnings,
      tip: "",
    }
  }

  let tip = ""
  if (result.errors.length > 0) {
    const firstError = result.errors[0]
    tip = `Ligne ${firstError.line}: ${firstError.message} — ${firstError.context}`
  }

  return {
    success: false,
    message: `Pas tout à fait… réessaie ! (${result.errors.length} erreur${result.errors.length > 1 ? "s" : ""})`,
    errors: result.errors,
    warnings: result.warnings,
    tip,
  }
}

export default {
  checkExerciseFlexible,
  compareNormalizedCSS,
}
