import type { NormalizationResult } from "./types"
import { parseCSSwithLines } from "./parser"

/**
 * Compare deux ensembles de propriétés CSS normalisées
 */
export function compareNormalizedCSS(targetCSS: string, userCSS: string, flexibleFonts: boolean = false): NormalizationResult {
  const errors: NormalizationResult["errors"] = []
  const warnings: NormalizationResult["warnings"] = []

  const target = parseCSSwithLines(targetCSS, flexibleFonts)
  const user = parseCSSwithLines(userCSS, flexibleFonts)

  // Propriétés cibles manquantes ou incorrectes
  for (const [key, targetProp] of target.entries()) {
    const userProp = user.get(key)

    if (!userProp) {
      errors.push({
        line: targetProp.lineStart,
        message: `Propriété manquante ou sélecteur incorrect`,
        context: `Expected: ${targetProp.prop}: ${targetProp.value}`,
      })
      continue
    }

    if (userProp.normalized !== targetProp.normalized) {
      errors.push({
        line: userProp.lineStart,
        message: `Valeur incorrecte pour « ${userProp.prop} »`,
        context: `Attendu: « ${targetProp.normalized} » | Reçu: « ${userProp.normalized} »`,
      })
    }
  }

  // Avertissements : propriétés superflues
  for (const [key, userProp] of user.entries()) {
    if (!target.has(key)) {
      warnings.push({
        line: userProp.lineStart,
        message: `Propriété supplémentaire : ${userProp.prop} (non demandée)`,
      })
    }
  }

  return {
    success: errors.length === 0,
    normalized: user,
    errors,
    warnings,
  }
}
