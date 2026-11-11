/**
 * Assombrit une couleur hexadécimale (par ex. pour l'effet d'ombre 3D Duolingo).
 */
export function darkenHex(hex: string, factor: number = 0.75): string {
  if (!hex) return '#cbd5e1'
  let color = hex.replace('#', '')
  if (color.length === 3) {
    color = color.split('').map(x => x + x).join('')
  }

  const r = Math.floor(parseInt(color.substring(0, 2), 16) * factor)
  const g = Math.floor(parseInt(color.substring(2, 4), 16) * factor)
  const b = Math.floor(parseInt(color.substring(4, 6), 16) * factor)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
