<template>
  <section class="exercise-page">

    <!-- ── HEADER (progress + lives + XP) ──────────────────────────────────── -->
    <div class="ex-header">
      <RouterLink to="/" class="ex-close" title="Quitter l'exercice">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6"  x2="6"  y2="18"/>
          <line x1="6"  y1="6"  x2="18" y2="18"/>
        </svg>
      </RouterLink>

      <div class="ex-progress-track"
        role="progressbar"
        :aria-valuenow="progressPercent"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Progression">
        <div class="ex-progress-fill" :style="{ width: progressPercent + '%' }"/>
      </div>

      <div class="ex-lives" aria-label="Vies restantes">
        <span
          v-for="i in MAX_LIVES" :key="i"
          class="heart" :class="{ 'heart--lost': i > livesLeft }"
          aria-hidden="true">❤</span>
      </div>

      <div class="ex-xp" aria-label="XP gagnés">
        <span class="xp-icon">⚡</span>
        <span class="xp-value">{{ totalXP }}</span>
      </div>
    </div>

    <!-- ── EXERCISE CARD ───────────────────────────────────────────────────── -->
    <div v-if="!completed" class="ex-content">
      <div class="ex-card">

        <!-- Theory collapsible ── -->
        <div class="ex-theory" :class="{ 'ex-theory--open': showTheory }">
          <button class="theory-toggle" @click="showTheory = !showTheory">
            <span class="theory-toggle-left">
              <span class="theory-dot"/>
              <span class="theory-tag">📚 Cours</span>
              <strong class="theory-notion-name">{{ currentExercise.notionTitle }}</strong>
            </span>
            <span class="theory-chevron" :class="{ open: showTheory }">▾</span>
          </button>
          <Transition name="expand">
            <div v-if="showTheory" class="theory-body">
              <p class="theory-text" v-html="markup(currentExercise.notionExplanation)"/>
              <pre v-if="currentExercise.notionExample" class="theory-code"><code>{{ currentExercise.notionExample }}</code></pre>
            </div>
          </Transition>
        </div>

        <!-- Meta: breadcrumb + dots + badges + title ── -->
        <div class="ex-meta">
          <div class="ex-top-row">
            <div class="ex-breadcrumb">
              <span class="breadcrumb-module">{{ currentExercise.moduleIcon }} {{ currentExercise.moduleTitle }}</span>
              <span class="breadcrumb-sep">›</span>
              <span class="breadcrumb-notion">{{ currentExercise.notionTitle }}</span>
            </div>
            <span class="ex-counter">{{ currentIndex + 1 }}&thinsp;/&thinsp;{{ exercises.length }}</span>
          </div>

          <!-- Notion exercise dots -->
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

          <div class="ex-badge-row">
            <span class="badge-css">CSS</span>
            <span v-if="isChallenge(currentExercise)" class="badge-challenge">⚡ Challenge</span>
            <span class="badge-xp">+{{ currentExercise.xp }} XP</span>
          </div>
          <h2 class="ex-title" v-html="markup(currentExercise.objective)"/>
        </div>

        <!-- Workspace: Target | Editor | Live preview ── -->
        <div class="ex-workspace">

          <!-- Pane 1 – Objectif -->
          <div class="ex-pane">
            <div class="pane-header">
              <span class="pane-dot" style="background:#1cb0f6"/>
              🎯 Objectif
            </div>
            <div class="pane-body pane--preview">
              <iframe
                class="preview-iframe"
                :srcdoc="targetSrcdoc"
                sandbox="allow-same-origin"
                title="Aperçu cible"
              />
            </div>
          </div>

          <!-- Pane 2 – Code editor -->
          <div class="ex-pane ex-pane--editor">
            <div class="pane-header">
              <span class="pane-dot" style="background:#a855f7"/>
              ✏️ Ton CSS
              <button class="reset-btn" @click="resetCode" title="Réinitialiser le code">↺</button>
            </div>
            <div class="pane-body pane--code">
              <div class="editor-wrapper">
                <div class="line-nums" ref="lineNumsRef" aria-hidden="true">
                  <div v-for="n in lineCount" :key="n" class="line-num">{{ n }}</div>
                </div>
                <textarea
                  ref="editorRef"
                  v-model="userCSS"
                  @input="onInput"
                  @keydown.ctrl.enter.prevent="checkAnswer"
                  @keydown.meta.enter.prevent="checkAnswer"
                  @keydown.tab.prevent="insertTab"
                  @scroll="onEditorScroll"
                  class="css-textarea"
                  spellcheck="false"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                />
              </div>
            </div>
            <div class="editor-footer">
              <span class="kbd-hint"><kbd>Tab</kbd> = 2 espaces &nbsp;·&nbsp; <kbd>Ctrl</kbd>+<kbd>↵</kbd> vérifier</span>
              <span class="line-count-badge">{{ lineCount }} lignes</span>
            </div>
          </div>

          <!-- Pane 3 – Aperçu en direct -->
          <div class="ex-pane">
            <div class="pane-header">
              <span class="pane-dot" style="background:#58cc02"/>
              👁️ Aperçu live
            </div>
            <div class="pane-body pane--preview">
              <iframe
                class="preview-iframe"
                :srcdoc="livePreviewSrcdoc"
                sandbox="allow-same-origin"
                title="Aperçu en direct"
              />
            </div>
          </div>

        </div>

        <!-- Hints ── -->
        <Transition name="slide-down">
          <div v-if="showHint" class="ex-hints" role="note" aria-live="polite">
            <div class="hints-header">
              <span class="hints-title">💡 Indices</span>
              <span class="hints-progress">{{ hintIndex + 1 }}/{{ currentExercise.hints.length }}</span>
            </div>
            <div class="hint-list">
              <div v-for="(hint, i) in visibleHints" :key="i" class="hint-item">
                <span class="hint-num">{{ i + 1 }}</span>
                <span v-html="markup(hint)"/>
              </div>
            </div>
            <button
              v-if="hintIndex < currentExercise.hints.length - 1"
              class="hint-next-btn"
              @click="revealNextHint"
            >
              Indice suivant →
            </button>
          </div>
        </Transition>

        <!-- XP float animation ── -->
        <Transition name="xp-pop">
          <div v-if="showXPGain" class="xp-float" aria-hidden="true">
            +{{ lastXPGain }} XP ⚡
          </div>
        </Transition>

        <!-- Action buttons ── -->
        <div class="ex-actions">
          <button class="btn-hint-toggle" @click="toggleHint">
            <span class="btn-hint-icon">💡</span>
            {{ showHint ? 'Cacher' : 'Indice' }}
            <span class="hint-count-badge">{{ currentExercise.hints.length }}</span>
          </button>
          <button
            class="btn-verify"
            @click="checkAnswer"
            :disabled="!userCSS.trim() || checking"
            :class="{ 'btn-verify--loading': checking }">
            <span v-if="checking" class="btn-dots"><span/><span/><span/></span>
            <span v-else>Vérifier ✓</span>
          </button>
        </div>

        <!-- Feedback banner ── -->
        <Transition name="slide-up">
          <div v-if="feedback"
            class="ex-feedback"
            :class="feedback.success ? 'ex-feedback--success' : 'ex-feedback--error'"
            role="alert">
            <div class="feedback-body">
              <span class="feedback-emoji">{{ feedback.success ? '🎉' : '🤔' }}</span>
              <div>
                <strong class="feedback-title">{{ feedback.message }}</strong>
                <ul v-if="feedback.errors?.length" class="feedback-errors">
                  <li v-for="err in feedback.errors" :key="err">{{ err }}</li>
                </ul>
              </div>
            </div>
            <button v-if="feedback.success"
              class="btn-continue"
              @click="nextExercise">
              Continuer →
            </button>
            <button v-else
              class="btn-retry"
              @click="feedback = null">
              Réessayer
            </button>
          </div>
        </Transition>

      </div>
    </div>

    <!-- ── COMPLETION SCREEN ────────────────────────────────────────────────── -->
    <div v-else class="ex-done">
      <div class="done-card">
        <div class="done-stars">
          <span
            v-for="s in 3" :key="s"
            class="done-star"
            :class="{ 'done-star--lit': s <= starRating }"
            aria-hidden="true">★</span>
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
import { ref, computed, nextTick } from 'vue'
import cssData from '../../cssModules.json'

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Exercise data (loaded from cssModules.json) ──────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_LIVES = 3
const API_URL = '/api/exercise/check'

// ─── Reactive state ─────────────────────────────────────────────

const currentIndex  = ref(0)
const userCSS       = ref(exercises[0]?.starterCSS ?? '')
const feedback      = ref<Feedback | null>(null)
const showHint      = ref(false)
const hintIndex     = ref(0)
const livesLeft     = ref(MAX_LIVES)
const totalXP       = ref(0)
const completed     = ref(false)
const editorRef     = ref<HTMLTextAreaElement | null>(null)
const lineNumsRef   = ref<HTMLDivElement | null>(null)
const checking      = ref(false)
const showTheory    = ref(false)
const showXPGain    = ref(false)
const lastXPGain    = ref(0)
const hintsUsed     = ref(0)
const completedIds  = ref(new Set<string>())

// ─── Derived / computed ───────────────────────────────────────────────────────

const currentExercise = computed(() => exercises[currentIndex.value])
const progressPercent = computed(() => (currentIndex.value / exercises.length) * 100)
const visibleHints    = computed(() => currentExercise.value.hints.slice(0, hintIndex.value + 1))
const lineCount       = computed(() => (userCSS.value.match(/\n/g)?.length ?? 0) + 1)

/** Exercises in the same notion as the current one (for dots nav) */
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
  return 'Tu as terminé le parcours. Recommence pour t\'améliorer !'
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function markup(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
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
    ? { success: true,  message: '🎉 Parfait ! Beau travail !',       errors: [] }
    : { success: false, message: 'Pas tout à fait… réessaie !', errors }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

async function checkAnswer() {
  if (!userCSS.value.trim() || checking.value) return
  checking.value = true
  let result: Feedback

  try {
    const res = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        exerciseId: currentExercise.value.id,
        userCSS: userCSS.value,
      }),
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
  feedback.value   = null
  showHint.value   = false
  hintIndex.value  = 0
  showTheory.value = false

  if (currentIndex.value < exercises.length - 1) {
    currentIndex.value++
    userCSS.value = currentExercise.value.starterCSS
  } else {
    completed.value = true
  }
  nextTick(() => editorRef.value?.focus())
}

function onInput() {
  feedback.value = null
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
  userCSS.value  = currentExercise.value.starterCSS
  feedback.value = null
  nextTick(() => editorRef.value?.focus())
}

function insertTab() {
  const ta = editorRef.value
  if (!ta) return
  const start = ta.selectionStart
  const end   = ta.selectionEnd
  userCSS.value = userCSS.value.slice(0, start) + '  ' + userCSS.value.slice(end)
  nextTick(() => { ta.selectionStart = ta.selectionEnd = start + 2 })
}

function onEditorScroll() {
  if (lineNumsRef.value && editorRef.value) {
    lineNumsRef.value.scrollTop = editorRef.value.scrollTop
  }
}

function jumpTo(id: string) {
  const idx = exercises.findIndex(e => e.id === id)
  if (idx === -1) return
  currentIndex.value = idx
  userCSS.value      = exercises[idx].starterCSS
  feedback.value     = null
  showHint.value     = false
  hintIndex.value    = 0
  showTheory.value   = false
  nextTick(() => editorRef.value?.focus())
}

function restart() {
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
  nextTick(() => editorRef.value?.focus())
}
</script>

<style scoped>
/* ─────────────────────────────────────────────────────────────────
   Page shell & CSS custom properties
───────────────────────────────────────────────────────────────── */
.exercise-page {
  --ex-blue:   #1cb0f6;
  --ex-green:  #58cc02;
  --ex-red:    #ff4b4b;
  --ex-card:   #ffffff;
  --ex-text:   #3c3c3c;
  --ex-muted:  #64748b;
  --ex-border: #e2e8f0;
  --ex-code:   #1e1e2e;
  --ex-radius: 18px;

  max-width: 960px;
  margin: 0 auto;
  padding: 0.5rem 0 5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ─────────────────────────────────────────────────────────────────
   Header bar
───────────────────────────────────────────────────────────────── */
.ex-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
}

.ex-close {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
}

.ex-progress-track {
  flex: 1;
  height: 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.ex-progress-fill {
  height: 100%;
  background: var(--ex-blue);
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 12px rgba(28, 176, 246, 0.45);
  min-width: 0;
}

.ex-lives {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.heart {
  font-size: 1.1rem;
  line-height: 1;
  transition: opacity 0.3s, transform 0.3s;
}

.heart--lost {
  opacity: 0.2;
  transform: scale(0.8);
  filter: grayscale(1);
}

.ex-xp {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  font-weight: 700;
  font-size: 0.85rem;
}

.xp-icon  { font-size: 1rem; }
.xp-value { color: #fbbf24; }

/* ─────────────────────────────────────────────────────────────────
   Exercise card
───────────────────────────────────────────────────────────────── */
.ex-content { display: contents; }

.ex-card {
  background: var(--ex-card);
  color: var(--ex-text);
  border-radius: var(--ex-radius);
  border: 2px solid var(--ex-border);
  box-shadow: 0 4px 0 #d1d5db;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Meta ──────── */
.ex-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ex-badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.badge-beginner {
  background: #fef3c7;
  color: #92400e;
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.ex-counter {
  color: var(--ex-muted);
  font-size: 0.82rem;
  font-weight: 600;
  margin-left: auto;
}

.ex-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
}

.ex-desc {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.65;

  :deep(code) {
    background: #f0f9ff;
    padding: 0.1em 0.4em;
    border-radius: 4px;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.88em;
    color: var(--ex-blue);
    border: 1px solid #bae6fd;
  }

  :deep(strong) { color: #0f172a; }
}

/* Workspace ──────── */
.ex-workspace {
  display: grid;
  grid-template-columns: 1fr 1.1fr 1fr;
  gap: 0.875rem;
  align-items: stretch;
}

@media (max-width: 700px) {
  .ex-workspace { grid-template-columns: 1fr; }
}

.ex-pane {
  border-radius: 12px;
  border: 2px solid var(--ex-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

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
}

.pane-body {
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 160px;
}

.pane--target  { background: #f0f9ff; }
.pane--preview { background: white; padding: 0; }

.pane--code {
  background: var(--ex-code);
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 0;
}

.css-textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #cdd6f4;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.82rem;
  line-height: 1.7;
  padding: 0.9rem 0.9rem 0.9rem 0.5rem;
  resize: none;
  width: 100%;
  caret-color: var(--ex-blue);

  &::placeholder { color: #44475a; }
  &:focus { background: rgba(255, 255, 255, 0.02); }
}

/* Hints ──────── */
.ex-hints {
  background: #fffbeb;
  border: 2px solid #fde68a;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* Actions ──────── */
.ex-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Feedback banner ──────── */
.ex-feedback {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 2px solid;
  flex-wrap: wrap;
}

.ex-feedback--success {
  background: #f0fdf4;
  border-color: #86efac;
  color: #14532d;
}

.ex-feedback--error {
  background: #fff1f2;
  border-color: #fca5a5;
  color: #7f1d1d;
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

.feedback-tip {
  margin: 0.4rem 0 0;
  font-size: 0.875rem;
  opacity: 0.8;
}

/* ─────────────────────────────────────────────────────────────────
   Completion screen
───────────────────────────────────────────────────────────────── */
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

.done-trophy {
  font-size: 4.5rem;
  animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes pop-in {
  0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.done-title { margin: 0; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.done-sub   { margin: 0; color: #475569; font-size: 1rem; }

.done-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.done-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

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

.done-actions {
  display: flex;
  gap: 0.875rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* ─────────────────────────────────────────────────────────────────
   Vue transitions
───────────────────────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.22s ease; }
.slide-down-enter-from,
.slide-down-leave-to     { opacity: 0; transform: translateY(-6px); }

.slide-up-enter-active,
.slide-up-leave-active { transition: all 0.28s ease; }
.slide-up-enter-from,
.slide-up-leave-to     { opacity: 0; transform: translateY(8px); }

/* ─────────────────────────────────────────────────────────────────
   Theory panel
───────────────────────────────────────────────────────────────── */
.ex-theory {
  border-radius: 12px;
  border: 2px solid #e0f2fe;
  background: #f0f9ff;
  overflow: hidden;
  transition: border-color 0.2s;
  &.ex-theory--open { border-color: #1cb0f6; }
}

.theory-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: #0369a1;
  gap: 0.75rem;
  text-align: left;
  &:hover { background: rgba(28, 176, 246, 0.06); }
}

.theory-toggle-left { display: flex; align-items: center; gap: 0.5rem; }

.theory-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #1cb0f6;
  flex-shrink: 0;
}

.theory-tag {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  background: #bae6fd;
  color: #0369a1;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.theory-notion-name { font-weight: 700; color: #0369a1; font-size: 0.875rem; }

.theory-chevron {
  font-size: 1.1rem;
  color: #1cb0f6;
  transition: transform 0.25s ease;
  flex-shrink: 0;
  &.open { transform: rotate(180deg); }
}

.theory-body {
  padding: 0 1rem 1rem;
  border-top: 2px solid #e0f2fe;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.theory-text {
  margin: 0;
  font-size: 0.875rem;
  color: #0c4a6e;
  line-height: 1.7;
  :deep(code) {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.1em 0.35em;
    border-radius: 4px;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.85em;
  }
  :deep(strong) { color: #0c4a6e; }
}

.theory-code {
  margin: 0;
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.65;
  overflow-x: auto;
  white-space: pre;
  code { font: inherit; }
}

/* expand transition */
.expand-enter-active, .expand-leave-active { transition: max-height 0.3s ease, opacity 0.3s ease; overflow: hidden; }
.expand-enter-from,  .expand-leave-to      { max-height: 0; opacity: 0; }
.expand-enter-to,    .expand-leave-from    { max-height: 600px; opacity: 1; }

/* ─────────────────────────────────────────────────────────────────
   Updated Meta (ex-top-row + notion dots + badges)
───────────────────────────────────────────────────────────────── */
.ex-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.notion-dots {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.notion-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, border-color 0.2s;
  &:hover { transform: scale(1.3); }
  &.notion-dot--current { background: #1cb0f6; border-color: #93c5fd; transform: scale(1.35); }
  &.notion-dot--done    { background: #58cc02; }
  &.notion-dot--challenge:not(.notion-dot--done) { background: #fde68a; border-color: #fbbf24; }
  &.notion-dot--challenge.notion-dot--done       { background: #ffc800; }
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

/* ─────────────────────────────────────────────────────────────────
   Preview iframe fill
───────────────────────────────────────────────────────────────── */
.preview-iframe {
  width: 100%;
  height: 100%;
  min-height: 160px;
  border: none;
  display: block;
}

/* ─────────────────────────────────────────────────────────────────
   Editor upgrades
───────────────────────────────────────────────────────────────── */
.ex-pane--editor { border-color: #44475a; }

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

.editor-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 160px;
}

.line-nums {
  display: flex;
  flex-direction: column;
  padding: 0.9rem 0.6rem 0.9rem 0.7rem;
  background: rgba(0,0,0,0.2);
  color: #4e5a72;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.7;
  user-select: none;
  overflow: hidden;
  flex-shrink: 0;
  text-align: right;
  min-width: 2rem;
}

.line-num { line-height: 1.7; }

.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.line-count-badge {
  font-size: 0.63rem;
  color: #3a4558;
  font-family: 'Roboto Mono', monospace;
}

/* ─────────────────────────────────────────────────────────────────
   Hints upgrades
───────────────────────────────────────────────────────────────── */
.hints-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hints-title    { font-size: 0.72rem; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.06em; }
.hints-progress { font-size: 0.72rem; color: #b45309; font-weight: 600; }

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

/* ─────────────────────────────────────────────────────────────────
   XP float animation
───────────────────────────────────────────────────────────────── */
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
  box-shadow: 0 4px 24px rgba(88, 204, 2, 0.5);
  white-space: nowrap;
}

.xp-pop-enter-active { animation: xpFloat 1.8s ease forwards; }
.xp-pop-leave-active { display: none; }

@keyframes xpFloat {
  0%   { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.7); }
  20%  { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1.1); }
  70%  { opacity: 1; transform: translateX(-50%) translateY(-12px) scale(1); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-45px) scale(0.9); }
}

/* ─────────────────────────────────────────────────────────────────
   New action buttons
───────────────────────────────────────────────────────────────── */
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
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  &:hover { border-color: #fbbf24; color: #92400e; background: #fffbeb; }
}

.btn-hint-icon  { font-size: 1rem; }

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
  box-shadow: 0 4px 0 #3ea200;
  transition: transform 0.1s, box-shadow 0.1s, opacity 0.2s;
  &:hover:not(:disabled)  { transform: translateY(-1px); box-shadow: 0 5px 0 #3ea200; }
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

/* ─────────────────────────────────────────────────────────────────
   Upgraded completion screen
───────────────────────────────────────────────────────────────── */
.done-stars {
  display: flex;
  gap: 0.5rem;
  margin-bottom: -0.5rem;
}

.done-star {
  font-size: 2.5rem;
  color: #e2e8f0;
  transition: color 0.4s, text-shadow 0.4s;
  &.done-star--lit {
    color: #ffc800;
    text-shadow: 0 0 20px rgba(255, 200, 0, 0.65);
  }
}
</style>
