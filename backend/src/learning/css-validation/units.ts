/**
 * Normalise les unités CSS (ex: "10 px" -> "10px", "0px" -> "0px")
 */
export function normalizeUnits(value: string): string {
  return value
    .replace(/(\d+)\s+(px|em|rem|%|vh|vw|deg|ms|s|fr|pt)\b/gi, '$1$2')
    .trim()
}

/**
 * Normalise les espaces blancs
 */
export function normalizeWhitespace(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

/**
 * Normalise les valeurs de couleur (hex court -> long, rgb/rgba/hsl sans espaces)
 */
export function normalizeColor(value: string): string {
  value = value.trim().toLowerCase()

  // Hex court -> long (#fff -> #ffffff)
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return (
      "#" +
      value
        .slice(1)
        .split("")
        .map((c) => c + c)
        .join("")
    )
  }

  // rgb/rgba/hsl/hsla normalisé (sans espaces internes)
  if (/^(rgba?|hsla?)\(/.test(value)) {
    return value.replace(/\s+/g, "")
  }

  return value
}

/**
 * Détecte la famille générique d'une police
 */
export function getFontFamily(fontStr: string): "serif" | "sans-serif" | "monospace" | "script" | "fantasy" | "unknown" {
  const lower = fontStr.toLowerCase()

  if (/\b(georgia|times|garamond|palatino|book|baskerville|cambria|classico)\b/.test(lower)) {
    return "serif"
  }
  if (/\b(arial|helvetica|verdana|trebuchet|tahoma|calibri|segoe|ubuntu|roboto|sans|gotham|futura)\b/.test(lower)) {
    return "sans-serif"
  }
  if (/\b(courier|consolas|monospace|courier new|monaco|menlo|inconsolata)\b/.test(lower)) {
    return "monospace"
  }
  if (/\b(brush|script|lucida|lucida handwriting)\b/.test(lower)) {
    return "script"
  }
  if (/\b(comic|comic sans|impact|papyrus|fantasy)\b/.test(lower)) {
    return "fantasy"
  }

  return "unknown"
}

/**
 * Normalise les font-family (tolère les variations et catégories)
 */
export function normalizeFontFamily(value: string, flexible: boolean = false): string {
  const parts = value.split(",").map((p) => p.trim().toLowerCase().replace(/['"]/g, ""))

  if (!flexible) {
    return parts.join(", ")
  }

  return parts
    .map((font) => {
      const category = getFontFamily(font)
      if (["serif", "sans-serif", "monospace", "script", "fantasy"].includes(font)) {
        return font
      }
      return category !== "unknown" ? category : font
    })
    .join(", ")
}

/**
 * Normalise les valeurs calc()
 */
export function normalizeCalc(value: string): string {
  return value.replace(/calc\s*\(\s*(.*?)\s*\)/g, (_match, inner) => {
    const normalized = inner
      .replace(/\s+/g, " ")
      .replace(/\s*([+\-*/])\s*/g, "$1")
      .trim()
    return `calc(${normalized})`
  })
}

/**
 * Normalise les font-size
 */
export function normalizeFontSize(value: string, _flexible: boolean = false): string {
  return normalizeUnits(value).trim().toLowerCase()
}

/**
 * Parse et normalise les variables CSS var(--x)
 */
export function normalizeVariable(value: string): string {
  return value.replace(/var\s*\(\s*(--[\w-]+)\s*\)/g, "var($1)")
}

/**
 * Normalise les propriétés de boîtes (padding, margin, etc.)
 */
export function normalizeSpacing(value: string): string {
  const parts = value
    .split(/\s+/)
    .map((p) => normalizeUnits(p))
    .filter((p) => p)

  if (parts.length === 4 && parts[0] === parts[1] && parts[1] === parts[2] && parts[2] === parts[3]) {
    return parts[0]
  }
  if (parts.length === 4 && parts[0] === parts[2] && parts[1] === parts[3]) {
    return `${parts[0]} ${parts[1]}`
  }

  return parts.join(" ")
}

/**
 * Normalise une propriété CSS en fonction de son nom
 */
export function normalizeProperty(prop: string, value: string, flexibleFonts: boolean = false): string {
  prop = prop.trim().toLowerCase()
  value = value.trim()

  if (["color", "background-color", "border-color", "outline-color", "caret-color"].includes(prop)) {
    return normalizeColor(value)
  }

  if (prop === "font-family") {
    return normalizeFontFamily(value, flexibleFonts)
  }

  if (prop === "font-size") {
    return normalizeFontSize(value, flexibleFonts)
  }

  if (["padding", "margin", "border-width", "border", "border-top", "border-right", "border-bottom", "border-left", "gap", "row-gap", "column-gap"].includes(prop)) {
    return normalizeSpacing(value)
  }

  if (value.includes("calc(")) {
    value = normalizeCalc(value)
  }

  if (value.includes("var(")) {
    value = normalizeVariable(value)
  }

  if (value.match(/\d+\s*(px|em|rem|%|vh|vw)/)) {
    value = normalizeUnits(value)
  }

  return normalizeWhitespace(value)
}
