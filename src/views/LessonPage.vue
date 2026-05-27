<template>
  <div class="lesson-layout" v-if="notion">
    <header class="lesson-topbar">
      <button class="btn-close" @click="router.push('/pathway')" title="Quitter la leçon">✖</button>
      <div class="topbar-title">Théorie : {{ notion.title }}</div>
      <div class="spacer"></div>
    </header>

    <main class="lesson-main">
      <div class="lesson-card">
        
        <div class="lesson-header">
          <div class="lesson-badge">📚 NOUVELLE NOTION</div>
          <h1 class="lesson-title">{{ notion.title }}</h1>
        </div>

        <div class="lesson-section">
          <p class="lesson-text" v-html="markup(notion.explanation)"></p>
        </div>

        <div class="lesson-section" v-if="notion.example">
          <h3 class="section-subtitle">Exemple concret :</h3>
          <div class="code-wrapper">
            <pre class="lesson-code"><code>{{ notion.example }}</code></pre>
          </div>
        </div>

        <div class="lesson-section" v-if="notion.checklist && notion.checklist.length">
          <h3 class="section-subtitle">À retenir pour les exercices :</h3>
          <ul class="checklist">
            <li v-for="(item, i) in notion.checklist" :key="i">
              <span class="check-icon">✓</span>
              <span class="check-text">{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="lesson-section doc-section" v-if="notion.docLinks && notion.docLinks.length">
          <h3 class="section-subtitle">Pour aller plus loin :</h3>
          <div class="doc-links">
            <a 
              v-for="(link, i) in parsedDocLinks" 
              :key="i" 
              :href="link.url" 
              target="_blank" 
              rel="noopener noreferrer"
              class="doc-btn"
            >
              🔗 {{ link.text }}
            </a>
          </div>
        </div>

      </div>
    </main>

    <footer class="lesson-bottom-bar">
      <div class="bottom-bar-content">
        <button class="btn-primary" @click="goToExercise">Passer à la pratique ➔</button>
      </div>
    </footer>
  </div>
  
  <div v-else class="error-screen">
    <h2>Leçon introuvable.</h2>
    <button class="btn-primary" @click="router.push('/pathway')">Retour au parcours</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import cssData from '@/data/cssModules.json'

const route = useRoute()
const router = useRouter()

const exerciseId = route.query.id as string

const notion = computed(() => {
  if (!exerciseId) return null
  for (const mod of cssData) {
    for (const n of mod.notions) {
      if (n.exercises.some(ex => ex.id === exerciseId)) {
        return n
      }
    }
  }
  return null
})

const parsedDocLinks = computed(() => {
  if (!notion.value?.docLinks) return []
  return notion.value.docLinks.map(linkStr => {
    const match = linkStr.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if (match) return { text: match[1], url: match[2] }
    return { text: "Documentation", url: linkStr }
  })
})

function markup(text: string): string {
  if (!text) return ''
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function goToExercise() {
  router.push(`/exercises?id=${exerciseId}`)
}
</script>

<style scoped>
.lesson-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc;
}

/* --- TOPBAR --- */
.lesson-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.15s;
}
.btn-close:hover { color: #0f172a; }

.topbar-title {
  font-weight: 800;
  color: #0f172a;
  font-size: 1.1rem;
}
.spacer { width: 24px; }

/* --- MAIN CONTENT --- */
.lesson-main {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem 1.5rem 8rem 1.5rem; /* Espace en bas pour la barre fixe */
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.lesson-card {
  max-width: 720px;
  width: 100%;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 4px 0 #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-sizing: border-box;
}

.lesson-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.lesson-badge {
  background: #e8f7fe;
  color: #1cb0f6;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  letter-spacing: 0.05em;
}

.lesson-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

/* Blocage de la largeur pour forcer le code à scroller au lieu d'étirer la carte */
.lesson-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0; 
  width: 100%;
}

.section-subtitle {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.lesson-text {
  font-size: 1.1rem;
  color: #334155;
  line-height: 1.7;
  margin: 0;
}

.lesson-text :deep(code) {
  background: #f1f5f9;
  color: #0ea5e9;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9em;
  font-weight: 600;
}

/* --- AFFICHAGE DU CODE --- */
.code-wrapper {
  width: 100%;
  background: #1e293b;
  border-radius: 16px;
  border: 2px solid #0f172a;
  overflow: hidden; /* Garde le conteneur propre */
}

.lesson-code {
  margin: 0;
  padding: 1.5rem;
  color: #f8fafc;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  overflow-x: auto; /* Défilement horizontal actif */
  white-space: pre; /* Conserve l'indentation sans forcer les retours à la ligne destructeurs */
  tab-size: 2;
}

.lesson-code code {
  font-family: inherit;
}

/* --- CHECKLIST --- */
.checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.checklist li {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #334155;
  line-height: 1.5;
}

.check-icon {
  background: #58cc02;
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.check-text {
  flex: 1;
}

/* --- DOC LINKS --- */
.doc-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.doc-btn {
  background: white;
  border: 2px solid #cbd5e1;
  color: #475569;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.95rem;
  box-shadow: 0 2px 0 #cbd5e1;
  transition: all 0.1s;
}

.doc-btn:hover {
  border-color: #94a3b8;
  color: #0f172a;
  transform: translateY(-1px);
  box-shadow: 0 3px 0 #94a3b8;
}

/* --- BOTTOM BAR FIXE --- */
.lesson-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  border-top: 2px solid #e2e8f0;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
  z-index: 100;
}

.bottom-bar-content {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: #1cb0f6;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  padding: 1rem 2.5rem;
  cursor: pointer;
  box-shadow: 0 4px 0 #0284c7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: transform 0.1s, box-shadow 0.1s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #0284c7;
}

.btn-primary:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #0284c7;
}

.error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
}

@media (max-width: 640px) {
  .lesson-card { 
    padding: 2rem 1.5rem; 
  }
  .lesson-title { 
    font-size: 1.8rem; 
  }
  .bottom-bar-content { 
    justify-content: center; 
  }
  .btn-primary { 
    width: 100%; 
  }
}
</style>