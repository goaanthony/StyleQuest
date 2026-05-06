<template>
  <section class="exercise-page">

    <div v-if="showLesson && !completed" class="lesson-screen">
      <div class="lesson-card">
        <div class="lesson-header">
          <span class="lesson-module-tag">{{ currentExercise.moduleIcon }} {{ currentExercise.moduleTitle }}</span>
          <div class="lesson-tag">📚 Cours</div>
          <h2 class="lesson-title">{{ currentExercise.notionTitle }}</h2>
        </div>
        <div class="lesson-body">
          <p class="lesson-text" v-html="markup(currentExercise.notionExplanation)"/>
          <pre v-if="currentExercise.notionExample" class="lesson-code"><code>{{ currentExercise.notionExample }}</code></pre>
        </div>
        <button class="btn-start-exercise" @click="startExercise">
          Commencer les exercices →
        </button>
      </div>
    </div>

    <template v-else-if="!completed">

      <div class="ex-subbar">
        <div class="ex-subbar-left">
          <span class="ex-subbar-name">{{ currentExercise.notionTitle }}</span>
          <div class="notion-dots" role="group" aria-label="Exercices dans cette notion">
            <button
              v-for="(ex, i) in notionExercises"
              :key="ex.id"
              class="notion-dot"
              :class="{
                'notion-dot--current': ex.id === currentExercise.id,
                'notion-dot--done': completedIds.has(ex.id),
                'notion-dot--challenge': isChallenge(ex),
              }"
              @click="jumpTo(ex.id)"
              :aria-label="`Exercice ${i + 1}`"
              :title="`Ex ${i + 1}`"
            />
          </div>
        </div>
        <div class="ex-subbar-right">
          <div class="ex-progress-track"
            role="progressbar"
            :aria-valuenow="progressPercent"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Progression">
            <div class="ex-progress-fill" :style="{ width: progressPercent + '%' }"/>
          </div>
          <span class="ex-counter">{{ currentIndex + 1 }}&thinsp;/&thinsp;{{ exercises.length }}</span>
        </div>
      </div>

      <div class="ex-objective-banner">
        <div class="ex-badge-row">
          <span class="badge-css">CSS</span>
          <span v-if="isChallenge(currentExercise)" class="badge-challenge">⚡ Challenge</span>
          <span class="badge-xp">+{{ currentExercise.xp }} XP</span>
        </div>
        <h2 class="ex-title" v-html="markup(currentExercise.objective)"/>
      </div>

      <div class="ex-workspace-wrap">
        <div class="ex-workspace">

          <div class="ex-pane ex-pane--target">
            <div class="pane-header">
              <span class="pane-dot" style="background:#1cb0f6"/>
              🎯 Objectif
            </div>
            <div class="pane-body pane--preview">
              <iframe class="preview-iframe" :srcdoc="targetSrcdoc" sandbox="allow-same-origin" title="Aperçu cible"/>
            </div>
            <div class="pane-overlay pane-overlay--bottom">
              <button class="btn-hint-toggle" @click="toggleHint">
                <span class="btn-hint-icon">💡</span>
                {{ showHint ? 'Cacher' : 'Indice' }}
                <span class="hint-count-badge">{{ currentExercise.hints.length }}</span>
              </button>
            </div>
          </div>

          <div class="ex-pane ex-pane--editor">
            <div class="pane-header">
              <span class="pane-dot" style="background:#a855f7"/>
              ✏️ Ton CSS
              <button class="reset-btn" @click="resetCode" title="Réinitialiser le code">↺</button>
            </div>
            <div class="pane-body pane--code">
              <div ref="monacoContainerRef" class="monaco-container"/>
            </div>
            <div class="editor-footer">
              <span class="kbd-hint"><kbd>Ctrl</kbd>+<kbd>↵</kbd> pour vérifier</span>
            </div>
          </div>

          <div class="ex-pane ex-pane--result">
            <div class="pane-header">
              <span class="pane-dot" style="background:#58cc02"/>
              👁️ Aperçu live
            </div>
            <div class="pane-body pane--preview">
              <iframe class="preview-iframe" :srcdoc="livePreviewSrcdoc" sandbox="allow-same-origin" title="Aperçu en direct"/>
            </div>
            <div class="pane-overlay pane-overlay--bottom">
              <button
                class="btn-verify"
                @click="checkAnswer"
                :disabled="!userCSS.trim() || checking"
                :class="{ 'btn-verify--loading': checking }">
                <span v-if="checking" class="btn-dots"><span/><span/><span/></span>
                <span v-else>Vérifier ✓</span>
              </button>
            </div>
          </div>

        </div>

        <Transition name="xp-pop">
          <div v-if="showXPGain" class="xp-float" aria-hidden="true">
            +{{ lastXPGain }} XP ⚡
          </div>
        </Transition>
      </div>

      <Transition name="toast">
        <div v-if="showHint" class="toast toast--hint" role="note" aria-live="polite">
          <div class="toast-inner">
            <div class="hints-header">
              <span class="hints-title">💡 Indices</span>
              <span class="hints-progress">{{ hintIndex + 1 }}/{{ currentExercise.hints.length }}</span>
              <button class="toast-close" @click="toggleHint" aria-label="Fermer">✕</button>
            </div>
            <div class="hint-list">
              <div v-for="(hint, i) in visibleHints" :key="i" class="hint-item">
                <span class="hint-num">{{ i + 1 }}</span>
                <span v-html="markup(hint)"/>
              </div>
            </div>
            <button v-if="hintIndex < currentExercise.hints.length - 1" class="hint-next-btn" @click="revealNextHint">
              Indice suivant →
            </button>
          </div>
        </div>
      </Transition>

      <Transition name="toast">
        <div v-if="feedback"
          class="toast"
          :class="feedback.success ? 'toast--success' : 'toast--error'"
          role="alert">
          <div class="toast-inner">
            <div class="feedback-body">
              <span class="feedback-emoji">{{ feedback.success ? '🎉' : '🤔' }}</span>
              <div>
                <strong class="feedback-title">{{ feedback.message }}</strong>
                <ul v-if="feedback.errors?.length" class="feedback-errors">
                  <li v-for="err in feedback.errors" :key="err">{{ err }}</li>
                </ul>
              </div>
            </div>
            <div class="toast-actions">
              <button v-if="feedback.success" class="btn-continue" @click="nextExercise">Continuer →</button>
              <button v-else class="btn-retry" @click="feedback = null">Réessayer</button>
            </div>
          </div>
        </div>
      </Transition>

    </template>

    <div v-else class="ex-done">
      <div class="done-card">
        <div class="done-stars">
          <span v-for="s in 3" :key="s" class="done-star" :class="{ 'done-star--lit': s <= starRating }" aria-hidden="true">★</span>
        </div>
        <div class="done-trophy">🏆</div>
        <h2 class="done-title">{{ doneTitle }}</h2>
        <p class="done-sub">{{ doneSub }}</p>
        <div class="done-stats">
          <div class="done-stat">
            <span class="done-val">{{ totalXP }}<small> XP</small></span>
            <span class="done-label">Total gagné</span>
          </div>
          <div class="done-stat">
            <span class="done-val">{{ exercises.length }}</span>
            <span class="done-label">Exercices</span>
          </div>
          <div class="done-stat">
            <span class="done-val" :style="{ color: livesLeft > 0 ? '#58cc02' : '#ff4b4b' }">
              {{ livesLeft }}<small>/{{ MAX_LIVES }}</small>
            </span>
            <span class="done-label">Vies</span>
          </div>
          <div class="done-stat">
            <span class="done-val">{{ hintsUsed }}</span>
            <span class="done-label">Indices</span>
          </div>
        </div>
        <div class="done-actions">
          <button class="btn-simple btn-md btn-green" @click="restart">Recommencer 🔄</button>
          <RouterLink class="btn-simple btn-md" to="/">Accueil</RouterLink>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import loader from '@monaco-editor/loader'
import type * as Monaco from 'monaco-editor'
import cssData from '../data/cssModules.json'

interface FlatExercise {
  id: string
  objective: string
  xp: number
  hints: string[]
  html: string
  targetCSS: string
  starterCSS: string
  moduleTitle: string
  moduleIcon: string
  notionTitle: string
  notionExplanation: string
  notionExample: string
}

interface Feedback {
  success: boolean
  message: string
  errors: string[]
}

const exercises: FlatExercise[] = []

for (const mod of cssData) {
  for (const notion of mod.notions) {
    for (const ex of notion.exercises) {
      exercises.push({
        id: ex.id,
        objective: ex.objective,
        xp: ex.xp,
        hints: ex.hints,
        html: ex.html,
        targetCSS: ex.targetCSS,
        starterCSS: ex.starterCSS,
        moduleTitle: mod.title,
        moduleIcon: mod.icon,
        notionTitle: notion.title,
        notionExplanation: notion.explanation,
        notionExample: notion.example,
      })
    }
  }
}

const MAX_LIVES = 3
const API_URL = '/api/exercise/check'

const currentIndex       = ref(0)
const userCSS            = ref(exercises[0]?.starterCSS ?? '')
const feedback           = ref<Feedback | null>(null)
const showHint           = ref(false)
const hintIndex          = ref(0)
const livesLeft          = ref(MAX_LIVES)
const totalXP            = ref(0)
const completed          = ref(false)
const checking           = ref(false)
const showXPGain         = ref(false)
const lastXPGain         = ref(0)
const hintsUsed          = ref(0)
const completedIds       = ref(new Set<string>())
const showLesson         = ref(true)
const seenNotions        = ref(new Set<string>())
const monacoContainerRef = ref<HTMLDivElement | null>(null)

let monacoEditor: Monaco.editor.IStandaloneCodeEditor | null = null
let monacoInitialized = false

const currentExercise = computed(() => exercises[currentIndex.value])
const progressPercent = computed(() => (currentIndex.value / exercises.length) * 100)
const visibleHints    = computed(() => currentExercise.value.hints.slice(0, hintIndex.value + 1))

const notionExercises = computed(() =>
  exercises.filter(e => e.notionTitle === currentExercise.value.notionTitle)
)

function isChallenge(ex: { objective: string }): boolean {
  return ex.objective.toUpperCase().includes('CHALLENGE')
}

const starRating = computed<1 | 2 | 3>(() => {
  if (livesLeft.value === MAX_LIVES && hintsUsed.value === 0) return 3
  if (livesLeft.value >= MAX_LIVES - 1)                        return 2
  return 1
})

const doneTitle = computed(() => {
  if (starRating.value === 3) return 'Parfait ! 🌟'
  if (starRating.value === 2) return 'Bien joué ! 👏'
  return 'Terminé ! 💪'
})

const doneSub = computed(() => {
  if (starRating.value === 3) return 'Aucune faute, aucun indice. Tu maîtrises le CSS !'
  if (starRating.value === 2) return 'Très bonne performance ! Continue comme ça !'
  return "Tu as terminé le parcours. Recommence pour t'améliorer !"
})

function buildSrcdoc(html: string, css: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 1.5rem; font-family: system-ui, sans-serif; font-size: 15px; line-height: 1.5; }
${css}
</style></head>${html}</html>`
}

const targetSrcdoc      = computed(() => buildSrcdoc(currentExercise.value.html, currentExercise.value.targetCSS))
const livePreviewSrcdoc = computed(() => buildSrcdoc(currentExercise.value.html, userCSS.value))

function markup(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function extractAllDeclarations(css: string): Record<string, string> {
  const result: Record<string, string> = {}
  const cleaned    = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const blockRegex = /[^{]*\{([^}]+)\}/g
  let match: RegExpExecArray | null
  while ((match = blockRegex.exec(cleaned)) !== null) {
    for (const decl of match[1].split(';')) {
      const idx = decl.indexOf(':')
      if (idx === -1) continue
      const prop = decl.slice(0, idx).trim().toLowerCase()
      const val  = decl.slice(idx + 1).trim().toLowerCase().replace(/\s+/g, ' ')
      if (prop && val) result[prop] = val
    }
  }
  return result
}

function localCheck(): Feedback {
  const ex     = currentExercise.value
  const target = extractAllDeclarations(ex.targetCSS)
  const user   = extractAllDeclarations(userCSS.value)
  const errors: string[] = []
  for (const [prop, targetVal] of Object.entries(target)) {
    const userVal = user[prop]
    if (!userVal) {
      errors.push(`Propriété manquante : ajoute « ${prop} »`)
    } else if (userVal !== targetVal) {
      errors.push(`« ${prop} » incorrect — attendu : « ${targetVal} »`)
    }
  }
  return errors.length === 0
    ? { success: true,  message: '🎉 Parfait ! Beau travail !', errors: [] }
    : { success: false, message: 'Pas tout à fait… réessaie !', errors }
}

async function initMonaco() {
  if (!monacoContainerRef.value) return
  const monaco = await loader.init()

  monacoEditor = monaco.editor.create(monacoContainerRef.value, {
    value: userCSS.value,
    language: 'css',
    theme: 'vs-dark',
    fontSize: 13,
    lineHeight: 22,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    padding: { top: 12, bottom: 12 },
    overviewRulerBorder: false,
    overviewRulerLanes: 0,
    folding: false,
    glyphMargin: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 3,
    renderLineHighlight: 'line',
    scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
  })

  monacoEditor.onDidChangeModelContent(() => {
    userCSS.value  = monacoEditor!.getValue()
    feedback.value = null
  })

  monacoEditor.addAction({
    id: 'verify-answer',
    label: 'Vérifier',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => checkAnswer(),
  })
}

onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  monacoEditor?.dispose()
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})

function setEditorValue(value: string) {
  userCSS.value = value
  if (monacoEditor && monacoEditor.getValue() !== value) {
    monacoEditor.setValue(value)
  }
}

function startExercise() {
  seenNotions.value.add(currentExercise.value.notionTitle)
  showLesson.value = false
  nextTick(async () => {
    if (!monacoInitialized) {
      await initMonaco()
      monacoInitialized = true
    }
    monacoEditor?.focus()
  })
}

async function checkAnswer() {
  if (!userCSS.value.trim() || checking.value) return
  checking.value = true
  let result: Feedback

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId: currentExercise.value.id, userCSS: userCSS.value }),
    })
    if (!res.ok) throw new Error('server error')
    result = await res.json() as Feedback
  } catch {
    result = localCheck()
  }

  checking.value = false
  feedback.value = result

  if (result.success) {
    totalXP.value += currentExercise.value.xp
    lastXPGain.value = currentExercise.value.xp
    completedIds.value = new Set([...completedIds.value, currentExercise.value.id])
    showXPGain.value = true
    setTimeout(() => { showXPGain.value = false }, 1800)
  } else {
    livesLeft.value = Math.max(0, livesLeft.value - 1)
  }
}

function nextExercise() {
  feedback.value  = null
  showHint.value  = false
  hintIndex.value = 0

  if (currentIndex.value < exercises.length - 1) {
    currentIndex.value++
    if (!seenNotions.value.has(currentExercise.value.notionTitle)) {
      monacoEditor?.dispose()
      monacoEditor = null
      monacoInitialized = false
      userCSS.value = currentExercise.value.starterCSS
      showLesson.value = true
    } else {
      setEditorValue(currentExercise.value.starterCSS)
    }
  } else {
    completed.value = true
  }
  nextTick(() => monacoEditor?.focus())
}

function toggleHint() {
  if (!showHint.value) {
    showHint.value  = true
    hintIndex.value = 0
    hintsUsed.value++
  } else {
    showHint.value  = false
    hintIndex.value = 0
  }
}

function revealNextHint() {
  if (hintIndex.value < currentExercise.value.hints.length - 1) {
    hintIndex.value++
    hintsUsed.value++
  }
}

function resetCode() {
  setEditorValue(currentExercise.value.starterCSS)
  feedback.value = null
  nextTick(() => monacoEditor?.focus())
}

function jumpTo(id: string) {
  const idx = exercises.findIndex(e => e.id === id)
  if (idx === -1) return
  currentIndex.value = idx
  userCSS.value      = exercises[idx].starterCSS
  feedback.value  = null
  showHint.value  = false
  hintIndex.value = 0
  if (!seenNotions.value.has(exercises[idx].notionTitle)) {
    monacoEditor?.dispose()
    monacoEditor = null
    monacoInitialized = false
    showLesson.value = true
  } else {
    setEditorValue(exercises[idx].starterCSS)
    nextTick(() => monacoEditor?.focus())
  }
}

function restart() {
  monacoEditor?.dispose()
  monacoEditor = null
  monacoInitialized = false
  currentIndex.value = 0
  userCSS.value      = exercises[0]?.starterCSS ?? ''
  feedback.value     = null
  showHint.value     = false
  hintIndex.value    = 0
  livesLeft.value    = MAX_LIVES
  totalXP.value      = 0
  completed.value    = false
  hintsUsed.value    = 0
  completedIds.value = new Set()
  seenNotions.value  = new Set()
  showLesson.value   = true
}
</script>

<style scoped>
.exercise-page {
  --ex-blue:   #1cb0f6;
  --ex-green:  #58cc02;
  --ex-red:    #ff4b4b;
  --ex-card:   #ffffff;
  --ex-text:   #1e293b;
  --ex-muted:  #64748b;
  --ex-border: #e2e8f0;
  --ex-code:   #1e1e2e;
  --ex-radius: 18px;

  height: 100vh;
  overflow: hidden;
  width: 100%;
  padding: 0.5rem 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.lesson-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #f1f5f9;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1.5rem 4rem;
}

.lesson-card {
  background: var(--ex-card);
  color: var(--ex-text);
  border-radius: var(--ex-radius);
  border: 2px solid #e0f2fe;
  box-shadow: 0 4px 0 #bae6fd;
  padding: 2.25rem 2.5rem;
  max-width: 720px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lesson-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lesson-module-tag {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ex-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.lesson-tag {
  display: inline-flex;
  align-self: flex-start;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  background: #bae6fd;
  color: #0369a1;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.lesson-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0c4a6e;
  line-height: 1.25;
}

.lesson-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lesson-text {
  margin: 0;
  font-size: 0.95rem;
  color: #0c4a6e;
  line-height: 1.75;
  :deep(code) {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.1em 0.4em;
    border-radius: 4px;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.88em;
  }
  :deep(strong) { color: #0c4a6e; }
}

.lesson-code {
  margin: 0;
  background: var(--ex-code);
  color: #cdd6f4;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.82rem;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
  code { font: inherit; }
}

.btn-start-exercise {
  align-self: flex-end;
  background: var(--ex-blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 800;
  padding: 0.75rem 2rem;
  cursor: pointer;
  box-shadow: 0 4px 0 #0284c7;
  transition: transform 0.1s, box-shadow 0.1s;
  &:hover  { transform: translateY(-1px); box-shadow: 0 5px 0 #0284c7; }
  &:active { transform: translateY(2px);  box-shadow: 0 2px 0 #0284c7; }
}

.ex-subbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.875rem;
  background: #f1f5f9;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  flex-shrink: 0;
}

.ex-subbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.ex-subbar-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ex-subbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.ex-progress-track {
  width: 180px;
  height: 12px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.ex-progress-fill {
  height: 100%;
  background: var(--ex-blue);
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 10px rgba(28,176,246,0.45);
  min-width: 0;
}

.ex-counter {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.notion-dots {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.notion-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #cbd5e1;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, border-color 0.2s;
  &:hover { transform: scale(1.3); }
  &.notion-dot--current   { background: var(--ex-blue); border-color: #93c5fd; transform: scale(1.35); }
  &.notion-dot--done      { background: var(--ex-green); }
  &.notion-dot--challenge:not(.notion-dot--done) { background: #fde68a; border-color: #fbbf24; }
  &.notion-dot--challenge.notion-dot--done       { background: #ffc800; }
}

.ex-objective-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
  padding: 0.5rem 1rem;
  flex-shrink: 0;
}

.ex-badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.badge-css {
  background: var(--ex-blue);
  color: white;
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.badge-challenge {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.badge-xp {
  background: rgba(88,204,2,0.15);
  color: #58cc02;
  border: 1.5px solid rgba(88,204,2,0.3);
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.ex-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.35;
  :deep(code) {
    background: #f0f9ff;
    padding: 0.1em 0.4em;
    border-radius: 4px;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.88em;
    color: #0369a1;
    border: 1px solid #bae6fd;
  }
  :deep(strong) { color: #0f172a; }
}

.ex-workspace-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  max-height: calc(100vh - 250px);
  display: flex;
  flex-direction: column;
}

.ex-workspace {
  display: grid;
  grid-template-columns: 1fr 1.15fr 1fr;
  gap: 0.875rem;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}

@media (max-width: 700px) {
  .ex-workspace { grid-template-columns: 1fr; }
}

.ex-pane {
  border-radius: 12px;
  border: 2px solid var(--ex-border);
  overflow: visible;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  position: relative;
}

.ex-pane--editor { border-color: #44475a; }

.pane-overlay {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
}

.pane-overlay--bottom { bottom: 0.9rem; }

.pane-overlay > * { pointer-events: auto; }

.pane-header {
  padding: 0.45rem 0.8rem;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ex-muted);
  background: #f8fafc;
  border-bottom: 2px solid var(--ex-border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.pane-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pane-body {
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 0;
  overflow: hidden;
}

.pane--preview { background: white; padding: 0; }

.pane--code {
  background: var(--ex-code);
  flex-direction: column;
  align-items: stretch;
  padding: 0;
}

.monaco-container {
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.reset-btn {
  margin-left: auto;
  background: none;
  border: 1.5px solid #475569;
  border-radius: 6px;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  cursor: pointer;
  line-height: 1.4;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  &:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; border-color: #94a3b8; }
}

.editor-footer {
  display: flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  background: rgba(0,0,0,0.25);
  border-top: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.kbd-hint {
  font-size: 0.63rem;
  color: #4e5a72;
  font-family: 'Roboto Mono', monospace;
  kbd {
    background: rgba(255,255,255,0.07);
    color: #7a8aa0;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 3px;
    padding: 0.05em 0.3em;
    font-size: 0.9em;
  }
}

.xp-float {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #58cc02, #3ea200);
  color: white;
  font-weight: 900;
  font-size: 1.35rem;
  padding: 0.45rem 1.35rem;
  border-radius: 999px;
  pointer-events: none;
  z-index: 20;
  box-shadow: 0 4px 24px rgba(88,204,2,0.5);
  white-space: nowrap;
}

.xp-pop-enter-active { animation: xpFloat 1.8s ease forwards; }
.xp-pop-leave-active { display: none; }

@keyframes xpFloat {
  0%   { opacity: 0; transform: translateX(-50%) translateY(20px)  scale(0.7); }
  20%  { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1.1); }
  70%  { opacity: 1; transform: translateX(-50%) translateY(-12px)  scale(1);   }
  100% { opacity: 0; transform: translateX(-50%) translateY(-45px)  scale(0.9); }
}

.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  width: min(560px, calc(100vw - 2rem));
  pointer-events: auto;
}

.toast-inner {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  border: 2px solid;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  backdrop-filter: blur(4px);
}

.toast--hint .toast-inner    { background: #fffbeb; border-color: #fde68a; color: #92400e; }
.toast--success .toast-inner { background: #f0fdf4; border-color: #86efac; color: #14532d; }
.toast--error .toast-inner   { background: #fff1f2; border-color: #fca5a5; color: #7f1d1d; }

.toast-actions { display: flex; justify-content: flex-end; }

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  color: #b45309;
  opacity: 0.6;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  line-height: 1;
  transition: opacity 0.15s;
  &:hover { opacity: 1; }
}

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from,
.toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(20px); }

.hints-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hints-title    { font-size: 0.72rem; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.06em; }
.hints-progress { font-size: 0.72rem; color: #b45309; font-weight: 600; }

.hint-list { display: flex; flex-direction: column; gap: 0.5rem; }

.hint-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.875rem;
  color: #92400e;
  line-height: 1.55;
}

.hint-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: #fbbf24;
  color: #78350f;
  font-size: 0.68rem;
  font-weight: 800;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.hint-next-btn {
  align-self: flex-start;
  background: #fde68a;
  border: 1.5px solid #fbbf24;
  color: #92400e;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #fcd34d; }
}

.btn-hint-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: white;
  border: 2px solid #e2e8f0;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.55rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.1s;
  &:hover { border-color: #fbbf24; color: #92400e; background: #fffbeb; transform: translateY(-1px); }
}

.btn-hint-icon { font-size: 1rem; }

.hint-count-badge {
  background: #f1f5f9;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
}

.btn-verify {
  background: #58cc02;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 800;
  padding: 0.65rem 1.75rem;
  cursor: pointer;
  box-shadow: 0 4px 0 #3ea200, 0 3px 12px rgba(88,204,2,0.35);
  transition: transform 0.1s, box-shadow 0.1s, opacity 0.2s;
  &:hover:not(:disabled)  { transform: translateY(-1px); box-shadow: 0 5px 0 #3ea200, 0 4px 14px rgba(88,204,2,0.4); }
  &:active:not(:disabled) { transform: translateY(2px);  box-shadow: 0 2px 0 #3ea200; }
  &:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
}

.btn-verify--loading { opacity: 0.75; cursor: wait; }

.btn-dots {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  span {
    width: 5px; height: 5px;
    background: white;
    border-radius: 50%;
    animation: blink 1s infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; }
  40%           { opacity: 1; }
}

.feedback-body {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.feedback-emoji { font-size: 1.4rem; line-height: 1.2; flex-shrink: 0; }
.feedback-title { font-size: 1rem; font-weight: 700; display: block; }

.feedback-errors {
  margin: 0.4rem 0 0;
  padding-left: 1.2rem;
  font-size: 0.875rem;
  line-height: 1.55;
}

.btn-continue {
  background: #58cc02;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  padding: 0.6rem 1.5rem;
  cursor: pointer;
  box-shadow: 0 3px 0 #3ea200;
  flex-shrink: 0;
  transition: transform 0.1s;
  &:hover { transform: translateY(-1px); }
}

.btn-retry {
  background: #ff4b4b;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  padding: 0.6rem 1.5rem;
  cursor: pointer;
  box-shadow: 0 3px 0 #c41e1e;
  flex-shrink: 0;
  transition: transform 0.1s;
  &:hover { transform: translateY(-1px); }
}

.ex-done {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 55vh;
}

.done-card {
  background: white;
  color: #1e293b;
  border-radius: var(--ex-radius);
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 0 #d1d5db;
  padding: 2.75rem 2.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 440px;
  width: 100%;
}

.done-stars { display: flex; gap: 0.5rem; margin-bottom: -0.5rem; }

.done-star {
  font-size: 2.5rem;
  color: #e2e8f0;
  transition: color 0.4s, text-shadow 0.4s;
  &.done-star--lit { color: #ffc800; text-shadow: 0 0 20px rgba(255,200,0,0.65); }
}

.done-trophy {
  font-size: 4.5rem;
  animation: pop-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
}

@keyframes pop-in {
  0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.done-title { margin: 0; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.done-sub   { margin: 0; color: #475569; font-size: 1rem; }

.done-stats { display: flex; gap: 2rem; flex-wrap: wrap; justify-content: center; }

.done-stat { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }

.done-val {
  font-size: 2rem;
  font-weight: 800;
  color: var(--ex-green);
  line-height: 1.1;
  small { font-size: 0.5em; font-weight: 600; opacity: 0.65; }
}

.done-label {
  font-size: 0.7rem;
  color: var(--ex-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.done-actions { display: flex; gap: 0.875rem; flex-wrap: wrap; justify-content: center; }
</style>