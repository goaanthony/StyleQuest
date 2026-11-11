/**
 * Transforme le markdown inline simple (gras, code, retours à la ligne) en HTML.
 */
export function markup(text: string): string {
  if (!text) return ''
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

/**
 * Supprime les balises et caractères markdown pour les aperçus textuels.
 */
export function stripTags(text: string): string {
  if (!text) return ''
  return text.replace(/[`*]/g, '').trim()
}
