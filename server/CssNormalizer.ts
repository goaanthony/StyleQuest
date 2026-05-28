// ─── NORMALISEUR CSS INTELLIGENT ────────────────────────────────────────────
// Tolère les variations visuelles (blancs, polices, espacements)
// Rapporte les erreurs avec numéros de ligne

interface NormalizedProperty {
  prop: string;
  value: string;
  normalized: string;
  lineStart: number;
  lineEnd: number;
}

interface NormalizationResult {
  success: boolean;
  normalized: Map<string, NormalizedProperty>;
  errors: Array<{
    line: number;
    message: string;
    context: string;
  }>;
  warnings: Array<{
    line: number;
    message: string;
  }>;
}

// ─── UTILITAIRES DE NORMALISATION ───────────────────────────────────────────

/**
 * Normalise les valeurs de whitespace
 * "  10px   " → "10px"
 * Mais garde les espaces significatifs (multi-word values)
 */
function normalizeWhitespace(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ") // Collapse multiple spaces to one
    .toLowerCase();
}

/**
 * Normalise les valeurs de couleur (incluant HSL/HSLA)
 * #fff → #ffffff
 * rgb(255, 255, 255) → rgb(255,255,255)
 * hsl(0, 100%, 50%) → hsl(0,100%,50%)
 * white → white (pas de conversion)
 */
function normalizeColor(value: string): string {
  value = value.trim().toLowerCase();

  // Hex court → long
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return (
      "#" +
      value
        .slice(1)
        .split("")
        .map((c) => c + c)
        .join("")
    );
  }

  // rgb/rgba/hsl/hsla normalisé (sans espaces)
  if (/^(rgba?|hsla?)\(/.test(value)) {
    return value.replace(/\s+/g, "");
  }

  return value;
}

/**
 * Détecte la classe de polices (serif, sans-serif, monospace, etc.)
 */
function getFontFamily(fontStr: string): "serif" | "sans-serif" | "monospace" | "script" | "fantasy" | "unknown" {
  const lower = fontStr.toLowerCase();
  
  // Polices serif communes
  if (/\b(georgia|times|garamond|palatino|book|baskerville|cambria|classico)\b/.test(lower)) {
    return "serif";
  }
  
  // Polices sans-serif communes
  if (/\b(arial|helvetica|verdana|trebuchet|tahoma|calibri|segoe|ubuntu|roboto|sans|gotham|futura)\b/.test(lower)) {
    return "sans-serif";
  }
  
  // Polices monospace
  if (/\b(courier|consolas|monospace|courier new|monaco|menlo|inconsolata)\b/.test(lower)) {
    return "monospace";
  }
  
  // Polices script
  if (/\b(brush|script|lucida|lucida handwriting)\b/.test(lower)) {
    return "script";
  }
  
  // Polices fantasy
  if (/\b(comic|comic sans|impact|papyrus|fantasy)\b/.test(lower)) {
    return "fantasy";
  }
  
  return "unknown";
}

/**
 * Normalise les font-family (tolère les variations et catégories)
 * 'Arial', Arial → arial (sans-serif)
 * "Times New Roman", serif → times new roman, serif (serif)
 * 
 * En mode "flexible", accepte n'importe quelle police de la même catégorie
 */
function normalizeFontFamily(value: string, flexible: boolean = false): string {
  const parts = value.split(",").map((p) => p.trim().toLowerCase().replace(/['"]/g, ""));
  
  if (!flexible) {
    return parts.join(", ");
  }
  
  // Mode flexible: remplacer les noms spécifiques par leur catégorie
  return parts
    .map((font) => {
      const category = getFontFamily(font);
      // Garder les fallbacks génériques (serif, sans-serif, etc.)
      if (["serif", "sans-serif", "monospace", "script", "fantasy"].includes(font)) {
        return font;
      }
      return category !== "unknown" ? category : font;
    })
    .join(", ");
}

/**
 * Normalise les valeurs calc()
 * calc( 100% - 10px ) → calc(100%-10px)
 */
function normalizeCalc(value: string): string {
  return value.replace(/calc\s*\(\s*(.*?)\s*\)/g, (match, inner) => {
    // Normaliser le contenu de calc
    const normalized = inner
      .replace(/\s+/g, " ")
      .replace(/\s*([+\-*/])\s*/g, "$1")
      .trim();
    return `calc(${normalized})`;
  });
}

/**
 * Tolère les variations de tailles de police
 * 16px, 1em, 1rem peuvent être acceptés comme "équivalents" si en mode flexible
 * Mais en mode strict, on compare les valeurs exactes
 */
function normalizeFontSize(value: string, flexible: boolean = false): string {
  value = normalizeUnits(value).trim().toLowerCase();
  
  if (!flexible) {
    return value;
  }
  
  // En mode flexible, normaliser les tailles communes
  // 16px ≈ 1em ≈ 1rem (approximation pour l'apprentissage)
  // Mais garder les valeurs réelles pour la comparaison stricte
  
  return value;
}

/**
 * Parse et normalise les variables CSS (--var)
 */
function normalizeVariable(value: string): string {
  // var(--my-color) → var(--my-color)
  // var( --my-color ) → var(--my-color)
  return value.replace(/var\s*\(\s*(--[\w-]+)\s*\)/g, "var($1)");
}

/**
 * Normalise les propriétés de box model
 * Tolère les variations : "10px 5px" vs "10px 5px 10px 5px"
 */
function normalizeSpacing(value: string): string {
  const parts = value
    .split(/\s+/)
    .map((p) => normalizeUnits(p))
    .filter((p) => p);

  // Simplifie les padding/margin/border
  // 10px 10px 10px 10px → 10px
  if (parts.length === 4 && parts[0] === parts[1] && parts[1] === parts[2] && parts[2] === parts[3]) {
    return parts[0];
  }
  // 10px 5px 10px 5px → 10px 5px
  if (parts.length === 4 && parts[0] === parts[2] && parts[1] === parts[3]) {
    return `${parts[0]} ${parts[1]}`;
  }
  // 10px 5px 10px → 10px 5px 10px
  // (garder tel quel si asymétrique)

  return parts.join(" ");
}

/**
 * Normalise une seule propriété CSS
 */
function normalizeProperty(prop: string, value: string, flexibleFonts: boolean = false): string {
  prop = prop.trim().toLowerCase();
  value = value.trim();

  // Propriétés de couleur
  if (["color", "background-color", "border-color", "outline-color", "caret-color"].includes(prop)) {
    return normalizeColor(value);
  }

  // Font-family
  if (prop === "font-family") {
    return normalizeFontFamily(value, flexibleFonts);
  }

  // Font-size (tolérance optionnelle)
  if (prop === "font-size") {
    return normalizeFontSize(value, flexibleFonts);
  }

  // Spacing (padding, margin, border-width)
  if (["padding", "margin", "border-width", "border", "border-top", "border-right", "border-bottom", "border-left", "gap", "row-gap", "column-gap"].includes(prop)) {
    return normalizeSpacing(value);
  }

  // calc() expressions
  if (value.includes("calc(")) {
    value = normalizeCalc(value);
  }

  // Variables CSS (--var)
  if (value.includes("var(")) {
    value = normalizeVariable(value);
  }

  // Unités générales
  if (value.match(/\d+\s*(px|em|rem|%|vh|vw)/)) {
    value = normalizeUnits(value);
  }

  // Normalisation standard
  return normalizeWhitespace(value);
}

/**
 * Parse CSS avec tracking des numéros de ligne
 * Support: sélecteurs normaux, pseudo-éléments, @media, @keyframes
 */
function parseCSSwithLines(css: string, flexibleFonts: boolean = false): Map<string, NormalizedProperty> {
  const result = new Map<string, NormalizedProperty>();
  const lines = css.split("\n");

  let currentLine = 0;
  let inBlock = false;
  let currentSelector = "";
  let blockStartLine = 0;
  let nestedLevel = 0; // Pour @media et @keyframes

  // Regex pour parser CSS basique
  const cleanCSS = css.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    // Remplacer les commentaires par des espaces (garde les newlines)
    return match.replace(/[^\n]/g, " ");
  });

  const lines2 = cleanCSS.split("\n");

  for (let i = 0; i < lines2.length; i++) {
    const line = lines2[i];

    // Détecter les règles at (@media, @keyframes, @supports, etc.)
    if (line.trim().startsWith("@")) {
      // @media query { ... } ou @keyframes name { ... }
      currentSelector = line.trim();
      if (line.includes("{")) {
        nestedLevel++;
        blockStartLine = i + 1;
        inBlock = true;
      }
      continue;
    }

    // Trouver les sélecteurs (avant {)
    const openBrace = line.indexOf("{");
    if (openBrace !== -1) {
      const beforeBrace = line.substring(0, openBrace).trim();
      if (beforeBrace && !beforeBrace.startsWith("@")) {
        if (nestedLevel > 0) {
          // C'est un sélecteur à l'intérieur d'une @media ou @keyframes
          currentSelector = `${currentSelector} > ${beforeBrace}`;
        } else {
          currentSelector = beforeBrace;
        }
        blockStartLine = i + 1;
        inBlock = true;
      }
      continue;
    }

    // Trouver les propriétés (dans les {})
    const closeBrace = line.indexOf("}");
    if (closeBrace !== -1) {
      // Vérifier s'il y a des propriétés avant la fermeture
      const beforeBrace = line.substring(0, closeBrace).trim();
      if (beforeBrace && beforeBrace.includes(":")) {
        const colonIdx = beforeBrace.indexOf(":");
        const prop = beforeBrace.substring(0, colonIdx).trim();
        const valueRaw = beforeBrace.substring(colonIdx + 1);
        
        if (prop) {
          const value = valueRaw.trim();
          const normalized = normalizeProperty(prop, value, flexibleFonts);
          const key = `${currentSelector}::${prop}`;
          
          result.set(key, {
            prop,
            value,
            normalized,
            lineStart: blockStartLine,
            lineEnd: i + 1,
          });
        }
      }
      
      inBlock = false;
      if (nestedLevel > 0) nestedLevel--;
      continue;
    }

    if (inBlock && line.includes(":")) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;

      let prop = line.substring(0, colonIdx).trim();
      let valueRaw = line.substring(colonIdx + 1);

      // Enlever le semicolon s'il existe
      if (valueRaw.endsWith(";")) {
        valueRaw = valueRaw.slice(0, -1);
      }

      if (!prop) continue;

      const value = valueRaw.trim();
      const normalized = normalizeProperty(prop, value, flexibleFonts);
      const key = `${currentSelector}::${prop}`;

      result.set(key, {
        prop,
        value,
        normalized,
        lineStart: blockStartLine,
        lineEnd: i + 1,
      });
    }
  }

  return result;
}

/**
 * Compare deux sets de propriétés CSS normalisées
 */
export function compareNormalizedCSS(targetCSS: string, userCSS: string, flexibleFonts: boolean = false): NormalizationResult {
  const errors: NormalizationResult["errors"] = [];
  const warnings: NormalizationResult["warnings"] = [];

  const target = parseCSSwithLines(targetCSS, flexibleFonts);
  const user = parseCSSwithLines(userCSS, flexibleFonts);

  // Vérifier les propriétés manquantes ou incorrectes
  for (const [key, targetProp] of target.entries()) {
    const userProp = user.get(key);

    if (!userProp) {
      errors.push({
        line: targetProp.lineStart,
        message: `Propriété manquante ou sélecteur incorrect`,
        context: `Expected: ${targetProp.prop}: ${targetProp.value}`,
      });
      continue;
    }

    // Comparer les valeurs normalisées
    if (userProp.normalized !== targetProp.normalized) {
      errors.push({
        line: userProp.lineStart,
        message: `Valeur incorrecte pour « ${userProp.prop} »`,
        context: `Attendu: « ${targetProp.normalized} » | Reçu: « ${userProp.normalized} »`,
      });
    }
  }

  // Avertissements : propriétés supplémentaires (non-bloquant)
  for (const [key, userProp] of user.entries()) {
    if (!target.has(key)) {
      warnings.push({
        line: userProp.lineStart,
        message: `Propriété supplémentaire : ${userProp.prop} (non demandée)`,
      });
    }
  }

  return {
    success: errors.length === 0,
    normalized: user,
    errors,
    warnings,
  };
}

/**
 * Fonction publique pour vérifier l'exercice
 */
export function checkExerciseFlexible(targetCSS: string, userCSS: string, options: { flexibleFonts?: boolean } = {}): {
  success: boolean;
  message: string;
  errors: Array<{ line: number; message: string; context: string }>;
  warnings: Array<{ line: number; message: string }>;
  tip: string;
} {
  const { flexibleFonts = false } = options;
  const result = compareNormalizedCSS(targetCSS, userCSS, flexibleFonts);

  if (result.success) {
    return {
      success: true,
      message: "🎉 Parfait ! Beau travail !",
      errors: [],
      warnings: result.warnings,
      tip: "",
    };
  }

  // Générer un tip à partir de la première erreur
  let tip = "";
  if (result.errors.length > 0) {
    const firstError = result.errors[0];
    tip = `Ligne ${firstError.line}: ${firstError.message} — ${firstError.context}`;
  }

  return {
    success: false,
    message: `Pas tout à fait… réessaie ! (${result.errors.length} erreur${result.errors.length > 1 ? "s" : ""})`,
    errors: result.errors,
    warnings: result.warnings,
    tip,
  };
}

// ─── EXPORT POUR TESTS ──────────────────────────────────────────────────────
export default {
  compareNormalizedCSS,
  checkExerciseFlexible,
  normalizeProperty,
  parseCSSwithLines,
};