export interface NormalizedProperty {
  prop: string
  value: string
  normalized: string
  lineStart: number
  lineEnd: number
}

export interface NormalizationResult {
  success: boolean
  normalized: Map<string, NormalizedProperty>
  errors: Array<{
    line: number
    message: string
    context: string
  }>
  warnings: Array<{
    line: number
    message: string
  }>
}

export interface ExerciseCheckResult {
  success: boolean
  message: string
  errors: Array<{ line: number; message: string; context: string }>
  warnings: Array<{ line: number; message: string }>
  tip: string
}
