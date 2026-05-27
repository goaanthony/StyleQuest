<template>
  <div class="exercise-layout">
    
    <div v-if="completed" class="ex-done">
      <div class="done-card">
        <div class="done-stars">
          <span v-for="s in 3" :key="s" class="done-star" :class="{ 'done-star--lit': s <= starRating }">★</span>
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
            <span class="done-val" style="color: #ff9600;">🔥 {{ authStore.user?.current_winstreak || 0 }}</span>
            <span class="done-label">Série</span>
          </div>
          <div class="done-stat">
            <span class="done-val" style="color: #1cb0f6;">{{ hintsUsed }}</span>
            <span class="done-label">Indices utilisés</span>
          </div>
        </div>
        
        <div class="done-actions">
          <button class="btn-action btn-continue" style="padding: 1rem 3rem;" @click="continueToNextNotion">Continuer ➔</button>
          <div class="done-actions-secondary">
            <button class="btn-simple" @click="restart">Refaire 🔄</button>
            <RouterLink class="btn-simple" to="/pathway">Parcours 🗺️</RouterLink>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      
      <header class="ex-topbar">
        <button class="btn-quit" @click="router.push('/pathway')" title="Quitter l'exercice">✖</button>
        <div class="ex-progress">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
        
        <div class="ex-streak" :class="{ 'streak-bump': streakAnimating }" title="Série actuelle">
          <span class="fire-icon">🔥</span>
          <span class="streak-count">{{ authStore.user?.current_winstreak || 0 }}</span>
          <span v-if="streakAnimating" class="streak-plus-one">+1</span>
        </div>
      </header>

      <main class="ex-workspace-wrap">
        <div class="ex-objective-banner">
          <div class="ex-badge-row">
            <span class="badge-module">{{ currentExercise.notionTitle }}</span>
            <span v-if="isChallenge(currentExercise)" class="badge-challenge">⚡ Challenge</span>
            <span class="badge-xp">+{{ currentExercise.xp }} XP</span>
          </div>
          <h2 class="ex-title" v-html="markup(currentExercise.objective)"></h2>
        </div>

        <div class="ex-workspace">
          <div class="ex-pane ex-pane--target">
            <div class="pane-header"><span class="pane-dot" style="background:#1cb0f6"></span> 🎯 Objectif</div>
            <div class="pane-body pane--preview">
              <iframe class="preview-iframe" :srcdoc="targetSrcdoc" sandbox="allow-same-origin"></iframe>
            </div>
          </div>

          <div class="ex-pane ex-pane--editor">
            <div class="pane-header">
              <span class="pane-dot" style="background:#a855f7"></span> ✏️ Ton CSS
              <button class="reset-btn" @click="resetCode" title="Réinitialiser">↺</button>
            </div>
            <div class="pane-body pane--code">
              <div ref="monacoContainerRef" class="monaco-container"></div>
            </div>
          </div>

          <div class="ex-pane ex-pane--result">
            <div class="pane-header"><span class="pane-dot" style="background:#58cc02"></span> 👁️ Aperçu live</div>
            <div class="pane-body pane--preview">
              <iframe class="preview-iframe" :srcdoc="livePreviewSrcdoc" sandbox="allow-same-origin"></iframe>
            </div>
          </div>
        </div>

        <Transition name="xp-cool">
          <div v-if="showXPGain" class="xp-float-cool">
            ⚡ +{{ lastXPGain }} XP
          </div>
        </Transition>
        
        <Transition name="toast">
          <div v-if="showHint" class="hint-toast">
            <div class="hint-header">
              <span>💡 Indice {{ hintIndex + 1 }}/{{ currentExercise.hints.length }}</span>
              <button class="btn-close-hint" @click="showHint = false">✖</button>
            </div>
            <div class="hint-content" v-html="markup(currentExercise.hints[hintIndex])"></div>
            
            <div class="hint-actions">
              <button class="btn-nav-hint" @click="revealPrevHint" :disabled="hintIndex === 0">← Précédent</button>
              <button class="btn-nav-hint primary" @click="revealNextHint" :disabled="hintIndex === currentExercise.hints.length - 1">Suivant →</button>
            </div>
          </div>
        </Transition>
      </main>

      <footer class="ex-bottombar" :class="bottomBarClass">
        <div class="bottombar-content">
          <div class="bar-left">
            <button v-if="!feedback" class="btn-hint" @click="toggleHint">💡 Indice</button>
            <div v-if="feedback" class="feedback-msg">
              <div class="feedback-icon">{{ feedback.success ? '✅' : '❌' }}</div>
              <div class="feedback-text">
                <strong class="feedback-title">{{ feedback.message }}</strong>
                <p v-if="feedback.errors && feedback.errors.length" class="feedback-error-desc">{{ feedback.errors[0] }}</p>
              </div>
            </div>
          </div>

          <div class="bar-right">
            <button v-if="!feedback" class="btn-action btn-verify" @click="checkAnswer" :disabled="!userCSS.trim() || checking">
              <span v-if="checking">...</span><span v-else>Vérifier</span>
            </button>
            <button v-else-if="feedback.success" class="btn-action btn-continue" @click="nextExercise">Continuer</button>
            <button v-else class="btn-action btn-retry" @click="feedback = null">Réessayer</button>
          </div>
        </div>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import loader from '@monaco-editor/loader'
import type * as Monaco from 'monaco-editor'
import cssData from '@/data/cssModules.json'

interface FlatExercise {
  id: string; objective: string; xp: number; hints: string[];
  html: string; targetCSS: string; starterCSS: string;
  moduleId: number; notionId: string; notionTitle: string;
}

interface Feedback { success: boolean; message: string; errors: string[]; }

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const progressStore = useProgressStore()

const exercises: FlatExercise[] = []
for (const mod of cssData) {
  for (const notion of mod.notions) {
    for (const ex of notion.exercises) {
      exercises.push({
        id: ex.id, objective: ex.objective, xp: ex.xp, hints: ex.hints,
        html: ex.html, targetCSS: ex.targetCSS, starterCSS: ex.starterCSS,
        moduleId: mod.id, notionId: notion.id, notionTitle: notion.title,
      })
    }
  }
}

const targetId = route.query.id as string
const initialIndex = exercises.findIndex(e => e.id === targetId)
const currentIndex = ref(initialIndex !== -1 ? initialIndex : 0)

const API_CHECK_URL = 'http://localhost:3000/api/exercise/check'
const API_SCORE_URL = 'http://localhost:3000/api/scores'

const userCSS = ref(exercises[currentIndex.value]?.starterCSS ?? '')
const feedback = ref<Feedback | null>(null)
const showHint = ref(false)
const hintIndex = ref(0)
const totalXP = ref(0)
const completed = ref(false)
const checking = ref(false)
const showXPGain = ref(false)
const lastXPGain = ref(0)
const hintsUsed = ref(0)
const revealedHints = ref(new Set<number>())
const monacoContainerRef = ref<HTMLDivElement | null>(null)

// Gestion Winstreak Anim
const streakAnimating = ref(false)

let monacoEditor: Monaco.editor.IStandaloneCodeEditor | null = null
const currentExercise = computed(() => exercises[currentIndex.value])

const progressPercent = computed(() => {
  const notionExercises = exercises.filter(e => e.notionId === currentExercise.value.notionId)
  const localIndex = notionExercises.findIndex(e => e.id === currentExercise.value.id)
  return (localIndex / notionExercises.length) * 100
})

const bottomBarClass = computed(() => {
  if (!feedback.value) return ''
  return feedback.value.success ? 'bar--success' : 'bar--error'
})

const starRating = computed<1 | 2 | 3>(() => {
  if (hintsUsed.value === 0) return 3
  if (hintsUsed.value === 1) return 2
  return 1
})

const doneTitle = computed(() => starRating.value === 3 ? 'Parfait ! 🌟' : 'Terminé ! 💪')
const doneSub = computed(() => starRating.value === 3 ? 'Aucun indice utilisé !' : 'Continue comme ça !')

function isChallenge(ex: FlatExercise) { return ex.objective.toUpperCase().includes('CHALLENGE') }

function buildSrcdoc(html: string, css: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 1.5rem; font-family: system-ui, sans-serif; font-size: 15px; line-height: 1.5; }
${css}</style></head>${html}</html>`
}

const targetSrcdoc = computed(() => buildSrcdoc(currentExercise.value.html, currentExercise.value.targetCSS))
const livePreviewSrcdoc = computed(() => buildSrcdoc(currentExercise.value.html, userCSS.value))

function markup(text: string) {
  if (!text) return ''
  return text.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
}

async function initMonaco() {
  if (!monacoContainerRef.value) return
  const monaco = await loader.init()
  monacoEditor = monaco.editor.create(monacoContainerRef.value, {
    value: userCSS.value, language: 'css', theme: 'vs-dark', fontSize: 14,
    minimap: { enabled: false }, automaticLayout: true, padding: { top: 16, bottom: 16 },
    scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
  })
  monacoEditor.onDidChangeModelContent(() => { userCSS.value = monacoEditor!.getValue(); feedback.value = null; })
  monacoEditor.addAction({ id: 'verify-answer', label: 'Vérifier', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter], run: () => checkAnswer() })
}

onMounted(() => { initMonaco() })
onUnmounted(() => { monacoEditor?.dispose() })

function setEditorValue(value: string) {
  userCSS.value = value
  if (monacoEditor && monacoEditor.getValue() !== value) monacoEditor.setValue(value)
}

function triggerStreakAnimation() {
  streakAnimating.value = true
  setTimeout(() => { streakAnimating.value = false }, 1500)
}

async function syncProgressWithDB(xpGained: number) {
  try {
    const res = await fetch(API_SCORE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify({
        exerciseId: currentExercise.value.id, moduleId: currentExercise.value.moduleId,
        notionId: currentExercise.value.notionId, xpGained: xpGained
      })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.user && authStore.user) {
        const oldStreak = authStore.user.current_winstreak || 0
        authStore.user.xp_points = data.user.xp_points;
        authStore.user.current_winstreak = data.user.current_winstreak;
        authStore.user.longest_winstreak = data.user.longest_winstreak;
        
        // Si la winstreak a augmenté dans la DB, on joue l'animation !
        if (data.user.current_winstreak > oldStreak) {
          triggerStreakAnimation()
        }
      }
    }
  } catch (e) { console.error("Erreur DB:", e) }
}

async function checkAnswer() {
  if (!userCSS.value.trim() || checking.value) return
  checking.value = true
  try {
    const res = await fetch(API_CHECK_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId: currentExercise.value.id, userCSS: userCSS.value }),
    })
    const result = await res.json() as Feedback
    feedback.value = result

    if (result.success) {
      await syncProgressWithDB(currentExercise.value.xp)
      totalXP.value += currentExercise.value.xp
      lastXPGain.value = currentExercise.value.xp
      progressStore.markExerciseComplete(currentExercise.value.id, currentExercise.value.xp)
      
      // Déclenche l'animation XP
      showXPGain.value = true
      setTimeout(() => { showXPGain.value = false }, 1500)
    }
  } catch (err) { console.error(err) } finally { checking.value = false }
}

function nextExercise() {
  feedback.value = null; showHint.value = false; hintIndex.value = 0; revealedHints.value.clear();
  const nextIndex = currentIndex.value + 1
  if (nextIndex < exercises.length && exercises[nextIndex].notionId === currentExercise.value.notionId) {
    currentIndex.value = nextIndex
    setEditorValue(currentExercise.value.starterCSS)
    nextTick(() => monacoEditor?.focus())
  } else { completed.value = true }
}

// LOGIQUE POUR LE BOUTON "CONTINUER" GLOBAL DE FIN
function continueToNextNotion() {
  // On cherche le premier exercice de la prochaine notion disponible
  const nextExIndex = exercises.findIndex((ex, i) => i > currentIndex.value && ex.notionId !== currentExercise.value.notionId)
  
  if (nextExIndex !== -1) {
    const nextEx = exercises[nextExIndex]
    const isEval = nextEx.notionTitle.toLowerCase().includes('éval') || nextEx.notionTitle.toLowerCase().includes('eval')
    
    // Si ce n'est pas une évaluation, c'est une leçon.
    if (!isEval) {
      window.location.href = `/lesson?id=${nextEx.id}`
    } else {
      window.location.href = `/exercises?id=${nextEx.id}`
    }
  } else {
    // Si c'était la toute dernière notion du jeu
    router.push('/pathway')
  }
}

function toggleHint() {
  showHint.value = !showHint.value
  if (showHint.value && !revealedHints.value.has(0)) { revealedHints.value.add(0); hintsUsed.value++; }
}
function revealNextHint() {
  if (hintIndex.value < currentExercise.value.hints.length - 1) {
    hintIndex.value++
    if (!revealedHints.value.has(hintIndex.value)) { revealedHints.value.add(hintIndex.value); hintsUsed.value++; }
  }
}
function revealPrevHint() { if (hintIndex.value > 0) hintIndex.value-- }
function resetCode() { setEditorValue(currentExercise.value.starterCSS); feedback.value = null; nextTick(() => monacoEditor?.focus()); }
function restart() { completed.value = false; totalXP.value = 0; hintsUsed.value = 0; revealedHints.value.clear(); setEditorValue(currentExercise.value.starterCSS); }
</script>

<style scoped>
.exercise-layout { display: flex; flex-direction: column; height: 100vh; background-color: #f8fafc; overflow: hidden; }

/* --- TOP BAR --- */
.ex-topbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: white; border-bottom: 2px solid #e2e8f0; height: 70px; flex-shrink: 0; }
.btn-quit { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.btn-quit:hover { color: #0f172a; }
.ex-progress { flex: 1; max-width: 400px; margin: 0 2rem; }
.progress-bar-bg { width: 100%; height: 14px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: #58cc02; border-radius: 999px; transition: width 0.4s ease; }

/* STREAK & ANIMATION */
.ex-streak { 
  display: flex; 
  align-items: center; 
  gap: 0.4rem; 
  background: white; 
  border: 2px solid #e2e8f0; 
  padding: 0.4rem 0.8rem; 
  border-radius: 12px; 
  font-weight: 900; 
  color: #ff9600; 
  box-shadow: 0 3px 0 #e2e8f0;
  position: relative; /* important pour le petit +1 */
}

.streak-bump {
  animation: streakPulse 0.5s ease-out;
  background: #fff8e1;
  border-color: #ff9600;
}

@keyframes streakPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); box-shadow: 0 0 15px rgba(255,150,0,0.4); }
  100% { transform: scale(1); }
}

.fire-icon { font-size: 1.2rem; }
.streak-count { font-size: 1.05rem; }

.streak-plus-one {
  position: absolute;
  top: -15px;
  right: -5px;
  color: #ff9600;
  font-weight: 900;
  font-size: 1.2rem;
  animation: floatUpFade 1.5s ease-out forwards;
  pointer-events: none;
  text-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

@keyframes floatUpFade {
  0% { transform: translateY(0) scale(0.8); opacity: 0; }
  20% { transform: translateY(-10px) scale(1.2); opacity: 1; }
  80% { transform: translateY(-25px) scale(1); opacity: 1; }
  100% { transform: translateY(-35px) scale(0.8); opacity: 0; }
}

/* --- SPACE --- */
.ex-workspace-wrap { flex: 1; display: flex; flex-direction: column; padding: 1.5rem; gap: 1rem; min-height: 0; position: relative; }
.ex-objective-banner { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; flex-shrink: 0; }
.ex-badge-row { display: flex; gap: 0.5rem; justify-content: center; }
.badge-module, .badge-challenge, .badge-xp { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 0.25rem 0.6rem; border-radius: 999px; }
.badge-module { background: #a855f7; color: white; }
.badge-challenge { background: #fbbf24; color: #78350f; }
.badge-xp { background: #e8f5e9; color: #16a34a; border: 1px solid #bbf7d0; }
.ex-title { margin: 0; font-size: 1.3rem; color: #0f172a; max-width: 800px; }
.ex-title :deep(code) { background: #e2e8f0; padding: 0.1rem 0.4rem; border-radius: 6px; color: #0f172a; }
.ex-workspace { display: flex; gap: 1rem; flex: 1; min-height: 0; }
.ex-pane { flex: 1; display: flex; flex-direction: column; background: white; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
.pane-header { padding: 0.6rem 1rem; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.8rem; font-weight: 800; color: #64748b; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem; }
.pane-dot { width: 10px; height: 10px; border-radius: 50%; }
.reset-btn { margin-left: auto; border: none; background: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; }
.pane-body { flex: 1; min-height: 0; }
.pane--preview { background: white; }
.pane--code { background: #1e1e2e; }
.preview-iframe { width: 100%; height: 100%; border: none; }
.monaco-container { width: 100%; height: 100%; }


/* --- NOUVELLE ANIMATION XP (SIMPLE ET EN BAS À DROITE) --- */
.xp-float-cool {
  position: absolute;
  bottom: 120px; /* Juste au dessus de la bottom bar */
  right: 2rem;
  background: #ffc800;
  color: white;
  font-size: 1.4rem;
  font-weight: 900;
  padding: 0.5rem 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 0 #d97706, 0 4px 15px rgba(255, 200, 0, 0.3);
  z-index: 1000;
  pointer-events: none;
}

.xp-cool-enter-active { animation: xpCoolAnim 1.5s ease-out forwards; }
.xp-cool-leave-active { opacity: 0; transition: opacity 0.2s; }

@keyframes xpCoolAnim {
  0% { transform: translateY(20px) scale(0.8); opacity: 0; }
  20% { transform: translateY(0) scale(1.1); opacity: 1; }
  80% { transform: translateY(-30px) scale(1); opacity: 1; }
  100% { transform: translateY(-50px) scale(0.9); opacity: 0; }
}


/* --- TOAST INDICE --- */
.hint-toast { position: absolute; bottom: 20px; left: 2rem; background: white; border: 2px solid #e2e8f0; padding: 1.2rem; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 320px; z-index: 50; }
.hint-header { display: flex; justify-content: space-between; font-weight: 800; color: #f59e0b; margin-bottom: 0.8rem; }
.btn-close-hint { background: none; border: none; color: #94a3b8; cursor: pointer; }
.hint-content { font-size: 0.95rem; color: #334155; margin-bottom: 1rem; line-height: 1.5; }
.hint-content :deep(code) { background: #f1f5f9; padding: 0.1rem 0.3rem; border-radius: 4px; }
.hint-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.btn-nav-hint { flex: 1; background: white; border: 2px solid #e2e8f0; color: #64748b; padding: 0.6rem; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 0 #e2e8f0; transition: all 0.1s; }
.btn-nav-hint:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; transform: translateY(2px); }
.btn-nav-hint.primary:not(:disabled) { background: #f59e0b; border-color: #f59e0b; color: white; box-shadow: 0 3px 0 #d97706; }
.btn-nav-hint:not(:disabled):hover { transform: translateY(-1px); }
.btn-nav-hint:not(:disabled):active { transform: translateY(2px); box-shadow: 0 0 0 transparent; }

/* --- BOTTOM BAR --- */
.ex-bottombar { background: white; border-top: 2px solid #e2e8f0; padding: 1.5rem 2rem; height: 100px; flex-shrink: 0; transition: background 0.2s, border-color 0.2s; }
.bottombar-content { max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; height: 100%; }
.bar-left { display: flex; align-items: center; gap: 1rem; }
.bar-right { display: flex; align-items: center; }
.bar--success { background: #d7ffb8; border-color: #58cc02; }
.bar--error { background: #ffdfe0; border-color: #ff4b4b; }
.feedback-msg { display: flex; align-items: center; gap: 1rem; }
.feedback-icon { width: 50px; height: 50px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.feedback-text { display: flex; flex-direction: column; }
.feedback-title { font-size: 1.4rem; font-weight: 900; }
.bar--success .feedback-title { color: #46a302; }
.bar--error .feedback-title { color: #ea2b2b; }
.feedback-error-desc { margin: 0; font-size: 0.95rem; color: #ea2b2b; font-weight: 600; }
.btn-hint { background: white; border: 2px solid #e2e8f0; color: #64748b; font-weight: 800; padding: 0.8rem 1.5rem; border-radius: 16px; cursor: pointer; box-shadow: 0 2px 0 #e2e8f0; }
.btn-hint:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-action { border: none; border-radius: 16px; font-size: 1.1rem; font-weight: 800; padding: 0.8rem 2.5rem; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: transform 0.1s, box-shadow 0.1s; }
.btn-verify { background: #58cc02; color: white; box-shadow: 0 4px 0 #46a302; }
.btn-verify:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 0 #46a302; }
.btn-verify:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 2px 0 #46a302; }
.btn-verify:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: 0 4px 0 #cbd5e1; cursor: not-allowed; }
.btn-continue { background: #58cc02; color: white; box-shadow: 0 4px 0 #46a302; }
.btn-retry { background: #ff4b4b; color: white; box-shadow: 0 4px 0 #ea2b2b; }
.btn-continue:active, .btn-retry:active { transform: translateY(2px); box-shadow: 0 2px 0 transparent; }

/* --- DONE SCREEN --- */
.ex-done { display: flex; align-items: center; justify-content: center; height: 100%; background: #f8fafc; }
.done-card { background: white; border: 2px solid #e2e8f0; border-radius: 24px; padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; box-shadow: 0 8px 0 #e2e8f0; }
.done-stars { display: flex; gap: 0.5rem; font-size: 3rem; color: #e2e8f0; }
.done-star--lit { color: #ffc800; text-shadow: 0 0 20px rgba(255,200,0,0.5); }
.done-trophy { font-size: 5rem; }
.done-title { font-size: 2rem; font-weight: 900; color: #0f172a; margin: 0; }
.done-sub { font-size: 1.1rem; color: #64748b; margin: 0; }
.done-stats { display: flex; gap: 2rem; }
.done-stat { display: flex; flex-direction: column; align-items: center; }
.done-val { font-size: 2rem; font-weight: 900; color: #58cc02; }
.done-label { font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

.done-actions { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; width: 100%; }
.done-actions-secondary { display: flex; gap: 1rem; justify-content: center; }

.btn-simple { padding: 0.8rem 1.5rem; font-weight: 800; text-decoration: none; border-radius: 16px; border: 2px solid #e2e8f0; color: #64748b; box-shadow: 0 3px 0 #e2e8f0; background: white; cursor: pointer; }
.btn-simple:hover { transform: translateY(-1px); box-shadow: 0 4px 0 #e2e8f0; }
.btn-simple:active { transform: translateY(2px); box-shadow: 0 1px 0 #e2e8f0; }
</style>