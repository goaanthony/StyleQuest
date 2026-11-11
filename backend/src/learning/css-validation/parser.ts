import type { NormalizedProperty } from "./types"
import { normalizeProperty } from "./units"

/**
 * Parse CSS avec suivi des numéros de ligne
 * Support: sélecteurs normaux, pseudo-éléments, @media, @keyframes
 */
export function parseCSSwithLines(css: string, flexibleFonts: boolean = false): Map<string, NormalizedProperty> {
  const result = new Map<string, NormalizedProperty>()

  // Remplacer les commentaires par des espaces en préservant les retours à la ligne
  const cleanCSS = css.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    return match.replace(/[^\n]/g, " ")
  })

  const lines = cleanCSS.split("\n")
  let inBlock = false
  let currentSelector = ""
  let blockStartLine = 0
  let nestedLevel = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim().startsWith("@")) {
      currentSelector = line.trim()
      if (line.includes("{")) {
        nestedLevel++
        blockStartLine = i + 1
        inBlock = true
      }
      continue
    }

    const openBrace = line.indexOf("{")
    if (openBrace !== -1) {
      const beforeBrace = line.substring(0, openBrace).trim()
      if (beforeBrace && !beforeBrace.startsWith("@")) {
        if (nestedLevel > 0) {
          currentSelector = `${currentSelector} > ${beforeBrace}`
        } else {
          currentSelector = beforeBrace
        }
        blockStartLine = i + 1
        inBlock = true
      }
      continue
    }

    const closeBrace = line.indexOf("}")
    if (closeBrace !== -1) {
      const beforeBrace = line.substring(0, closeBrace).trim()
      if (beforeBrace && beforeBrace.includes(":")) {
        const colonIdx = beforeBrace.indexOf(":")
        const prop = beforeBrace.substring(0, colonIdx).trim()
        const valueRaw = beforeBrace.substring(colonIdx + 1)

        if (prop) {
          const value = valueRaw.trim()
          const normalized = normalizeProperty(prop, value, flexibleFonts)
          const key = `${currentSelector}::${prop}`

          result.set(key, {
            prop,
            value,
            normalized,
            lineStart: blockStartLine,
            lineEnd: i + 1,
          })
        }
      }

      inBlock = false
      if (nestedLevel > 0) nestedLevel--
      continue
    }

    if (inBlock && line.includes(":")) {
      const colonIdx = line.indexOf(":")
      if (colonIdx === -1) continue

      const prop = line.substring(0, colonIdx).trim()
      let valueRaw = line.substring(colonIdx + 1)

      if (valueRaw.endsWith(";")) {
        valueRaw = valueRaw.slice(0, -1)
      }

      if (!prop) continue

      const value = valueRaw.trim()
      const normalized = normalizeProperty(prop, value, flexibleFonts)
      const key = `${currentSelector}::${prop}`

      result.set(key, {
        prop,
        value,
        normalized,
        lineStart: blockStartLine,
        lineEnd: i + 1,
      })
    }
  }

  return result
}
