<template>
  <div class="lessons-library">
    <header class="library-header">
      <button class="btn-back" @click="router.push('/')">← Retour à l'accueil</button>
      <h1 class="page-title">Bibliothèque des Leçons</h1>
      <div class="spacer"></div>
    </header>

    <main class="library-content">
      <div v-for="mod in modules" :key="mod.id" class="module-section">
        
        <h2 class="module-title">
          <span class="module-icon">{{ mod.icon || '📘' }}</span>
          {{ mod.title }}
        </h2>

        <div class="notions-grid">
          <div v-for="notion in mod.notions" :key="notion.id" class="notion-card">
            <div class="notion-badge">Théorie</div>
            <h3 class="notion-title">{{ notion.title }}</h3>
            <p class="notion-desc">{{ stripTags(notion.explanation).substring(0, 90) }}...</p>
            
            <button class="btn-read" @click="goToLesson(notion)">
              Lire la leçon ➔
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import cssData from '@content/languages/css/curriculum.json'
import { stripTags } from '@/markup'

const router = useRouter()
const modules = cssData

function goToLesson(notion: any) {
  if (notion.exercises && notion.exercises.length > 0) {
    router.push(`/lesson?id=${notion.exercises[0].id}&source=lessons`)
  }
}
</script>

<style scoped>
.lessons-library {
  min-height: 100vh;
  background-color: #f8fafc;
  padding-bottom: 5rem;
}

/* --- TOPBAR --- */
.library-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: white;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
}

.btn-back {
  background: white;
  border: 2px solid #e2e8f0;
  color: #64748b;
  font-weight: 700;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 2px 0 #e2e8f0;
  transition: all 0.1s;
}
.btn-back:hover { transform: translateY(-1px); box-shadow: 0 3px 0 #e2e8f0; color: #0f172a; }
.btn-back:active { transform: translateY(2px); box-shadow: 0 0 0 transparent; }

.page-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.spacer { width: 100px; } /* Compense la largeur du bouton retour pour centrer le titre */

/* --- MAIN CONTENT --- */
.library-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.module-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.module-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #e2e8f0;
}

/* --- GRILLE DES CARTES --- */
.notions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.notion-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 0 #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.1s, box-shadow 0.1s;
}

.notion-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #cbd5e1;
}

.notion-badge {
  align-self: flex-start;
  background: #e8f7fe;
  color: #1cb0f6;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.notion-title {
  font-size: 1.3rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.notion-desc {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  flex: 1; /* Pousse le bouton vers le bas */
}

.btn-read {
  margin-top: auto;
  width: 100%;
  background: white;
  color: #1cb0f6;
  border: 2px solid #1cb0f6;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 800;
  padding: 0.8rem;
  cursor: pointer;
  transition: all 0.1s;
  box-shadow: 0 2px 0 #1cb0f6;
}

.btn-read:hover {
  background: #1cb0f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 3px 0 #0284c7;
}

.btn-read:active {
  transform: translateY(2px);
  box-shadow: 0 0 0 transparent;
}

@media (max-width: 640px) {
  .library-header { padding: 1rem; }
  .btn-back { font-size: 0.9rem; padding: 0.5rem 0.8rem; }
  .page-title { font-size: 1.2rem; }
  .spacer { width: 80px; }
  .library-content { padding: 2rem 1rem; }
}
</style>