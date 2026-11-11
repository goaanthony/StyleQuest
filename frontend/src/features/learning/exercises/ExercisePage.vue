<template>
  <div class="exercise-layout">
    <DoneScreen
      v-if="completed"
      :starRating="starRating"
      :totalXP="totalXP"
      :hintsUsed="hintsUsed"
      :winstreak="authStore.user?.current_winstreak || 0"
      @continue="continueToNextNotion"
      @restart="restart"
    />

    <template v-else>
      <ExerciseTopbar
        :progressPercent="progressPercent"
        :streakAnimating="streakAnimating"
        :winstreak="authStore.user?.current_winstreak || 0"
        @quit="router.push('/pathway')"
      />

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
          <div v-if="showXPGain" class="xp-float-cool">⚡ +{{ lastXPGain }} XP</div>
        </Transition>

        <HintToast
          :show="showHint"
          :hints="currentExercise.hints"
          :hintIndex="hintIndex"
          @close="showHint = false"
          @prev="revealPrevHint"
          @next="revealNextHint"
        />
      </main>

      <ExerciseBottombar
        :feedback="feedback"
        :checking="checking"
        :userCSS="userCSS"
        @hint="toggleHint"
        @verify="checkAnswer"
        @continue="nextExercise"
        @retry="feedback = null"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'
import { markup } from '@/markup'
import loader from '@monaco-editor/loader'
import type * as Monaco from 'monaco-editor'
import { useExerciseSession } from './useExerciseSession'
import DoneScreen from './components/DoneScreen.vue'
import ExerciseTopbar from './components/ExerciseTopbar.vue'
import ExerciseBottombar from './components/ExerciseBottombar.vue'
import HintToast from './components/HintToast.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const {
  currentExercise,
  userCSS,
  feedback,
  showHint,
  hintIndex,
  totalXP,
  completed,
  checking,
  showXPGain,
  lastXPGain,
  hintsUsed,
  streakAnimating,
  progressPercent,
  starRating,
  nextNotionExercise,
  setUserCSS,
  isChallenge,
  checkAnswer,
  nextExercise: advanceExercise,
  toggleHint,
  revealNextHint,
  revealPrevHint,
  resetCode: resetSessionCode,
  restart: restartSession,
} = useExerciseSession(route.query.id as string)
const monacoContainerRef = ref<HTMLDivElement | null>(null)

let monacoEditor: Monaco.editor.IStandaloneCodeEditor | null = null

function buildSrcdoc(html: string, css: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 1.5rem; font-family: system-ui, sans-serif; font-size: 15px; line-height: 1.5; }
${css}</style></head>${html}</html>`
}

const targetSrcdoc = computed(() => buildSrcdoc(currentExercise.value.html, currentExercise.value.targetCSS))
const livePreviewSrcdoc = computed(() => buildSrcdoc(currentExercise.value.html, userCSS.value))

async function initMonaco() {
  if (!monacoContainerRef.value) return
  const monaco = await loader.init()
  monacoEditor = monaco.editor.create(monacoContainerRef.value, {
    value: userCSS.value, language: 'css', theme: 'vs-dark', fontSize: 14,
    minimap: { enabled: false }, automaticLayout: true, padding: { top: 16, bottom: 16 },
    scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
  })
  monacoEditor.onDidChangeModelContent(() => setUserCSS(monacoEditor!.getValue()))
  monacoEditor.addAction({
    id: 'verify-answer', label: 'Vérifier',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => checkAnswer(),
  })
}

onMounted(() => initMonaco())
onUnmounted(() => monacoEditor?.dispose())

function setEditorValue(value: string) {
  setUserCSS(value)
  if (monacoEditor && monacoEditor.getValue() !== value) monacoEditor.setValue(value)
}

function nextExercise() {
  if (advanceExercise()) {
    setEditorValue(currentExercise.value.starterCSS)
    nextTick(() => monacoEditor?.focus())
  }
}

function continueToNextNotion() {
  if (nextNotionExercise.value) {
    const next = nextNotionExercise.value
    const isEval = next.notionTitle.toLowerCase().includes('éval') || next.notionTitle.toLowerCase().includes('eval')
    router.push({ path: isEval ? '/exercises' : '/lesson', query: { id: next.id } })
  } else {
    router.push('/pathway')
  }
}

function resetCode() {
  resetSessionCode()
  setEditorValue(userCSS.value)
  nextTick(() => monacoEditor?.focus())
}

function restart() {
  restartSession()
  setEditorValue(userCSS.value)
}
</script>

<style scoped>
.exercise-layout { display: flex; flex-direction: column; height: 100vh; background-color: #f8fafc; overflow: hidden; }
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
.xp-float-cool { position: absolute; bottom: 120px; right: 2rem; background: #ffc800; color: white; font-size: 1.4rem; font-weight: 900; padding: 0.5rem 1.25rem; border-radius: 16px; box-shadow: 0 4px 0 #d97706, 0 4px 15px rgba(255,200,0,0.3); z-index: 1000; pointer-events: none; }
.xp-cool-enter-active { animation: xpCoolAnim 1.5s ease-out forwards; }
.xp-cool-leave-active { opacity: 0; transition: opacity 0.2s; }
@keyframes xpCoolAnim {
  0% { transform: translateY(20px) scale(0.8); opacity: 0; }
  20% { transform: translateY(0) scale(1.1); opacity: 1; }
  80% { transform: translateY(-30px) scale(1); opacity: 1; }
  100% { transform: translateY(-50px) scale(0.9); opacity: 0; }
}
</style>
