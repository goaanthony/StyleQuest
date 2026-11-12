import type { NormalizedProperty } from "./types"
import { normalizeProperty } from "./units"

/**
 * Parse les déclarations CSS en conservant les sélecteurs et les numéros de ligne.
 */
export function parseCSSwithLines(css: string, flexibleFonts: boolean = false): Map<string, NormalizedProperty> {
  const result = new Map<string, NormalizedProperty>()
  const cleanCSS = css.replace(/\/\*[\s\S]*?\*\//g, (match) =>
    match.replace(/[^\n]/g, " "),
  )
  const lineStarts = [0]

  for (let i = 0; i < cleanCSS.length; i++) {
    if (cleanCSS[i] === "\n") lineStarts.push(i + 1)
  }

  function lineAt(index: number): number {
    let low = 0
    let high = lineStarts.length

    while (low < high) {
      const middle = Math.floor((low + high) / 2)
      if (lineStarts[middle] <= index) low = middle + 1
      else high = middle
    }

    return low
  }

  function addDeclaration(
    declaration: string,
    selector: string,
    lineStart: number,
    lineEnd: number,
  ) {
    const colonIndex = declaration.indexOf(":")
    if (!selector || colonIndex === -1) return

    const prop = declaration.slice(0, colonIndex).trim()
    const value = declaration.slice(colonIndex + 1).trim()
    if (!prop || !value) return

    result.set(`${selector}::${prop}`, {
      prop,
      value,
      normalized: normalizeProperty(prop, value, flexibleFonts),
      lineStart,
      lineEnd,
    })
  }

  function parseBlock(parentSelector: string, blockLine: number, start: number): number {
    let statementStart = start
    let quote = ""
    let parentheses = 0

    for (let i = start; i < cleanCSS.length; i++) {
      const char = cleanCSS[i]

      if (quote) {
        if (char === quote && cleanCSS[i - 1] !== "\\") quote = ""
        continue
      }

      if (char === '"' || char === "'") {
        quote = char
      } else if (char === "(") {
        parentheses++
      } else if (char === ")") {
        parentheses = Math.max(0, parentheses - 1)
      } else if (parentheses === 0 && char === ";") {
        addDeclaration(cleanCSS.slice(statementStart, i), parentSelector, blockLine, lineAt(i))
        statementStart = i + 1
      } else if (parentheses === 0 && char === "{") {
        const prelude = cleanCSS.slice(statementStart, i).trim()
        if (prelude) {
          const selector = parentSelector
            ? `${parentSelector} > ${prelude}`
            : prelude
          const nestedLine = lineAt(statementStart)
          i = parseBlock(selector, nestedLine, i + 1) - 1
        } else {
          statementStart = i + 1
        }
        statementStart = i + 1
      } else if (parentheses === 0 && char === "}") {
        addDeclaration(cleanCSS.slice(statementStart, i), parentSelector, blockLine, lineAt(i))
        return i + 1
      }
    }

    addDeclaration(cleanCSS.slice(statementStart), parentSelector, blockLine, lineAt(cleanCSS.length))
    return cleanCSS.length
  }

  parseBlock("", 1, 0)
  return result
}
