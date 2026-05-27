<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">Style<span class="auth-accent">Quest</span></h1>
        <p class="auth-subtitle">Rejoins l'aventure CSS</p>
      </div>

      <div class="auth-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Connexion
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Inscription
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            placeholder="Ex: SuperDev"
            class="form-input"
          />
        </div>

        <div class="form-group" v-if="activeTab === 'register'">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="ton@email.com"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="••••••••"
            class="form-input"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading">Chargement...</span>
          <span v-else>{{ activeTab === 'login' ? 'Se connecter' : 'Créer mon compte' }}</span>
        </button>
      </form>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'login' | 'register'>('login')
const loading = ref(false)
const error = ref('')

const formData = reactive({
  username: '',
  email: '',
  password: ''
})

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    let success = false
    if (activeTab.value === 'login') {
      success = await authStore.login(formData.username, formData.password)
    } else {
      success = await authStore.register(formData.username, formData.email, formData.password)
    }

    if (success) {
      router.push('/')
    } else {
      error.value = 'Erreur avec tes identifiants.'
    }
  } catch (err) {
    error.value = 'Une erreur est survenue.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 2rem;
}

.auth-card {
  background: #ffffff;
  border-radius: 18px;
  border: 2px solid #e2e8f0;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 0 #e2e8f0; /* Ombre solide typique Home/Ex */
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -1px;
}

.auth-accent {
  color: #1cb0f6;
}

.auth-subtitle {
  color: #64748b;
  font-size: 1.05rem;
  font-weight: 500;
  margin: 0.5rem 0 0;
}

.auth-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 2px 0 #e2e8f0;
  transition: all 0.1s;
}

.tab-btn.active {
  background: #e8f7fe;
  color: #1cb0f6;
  border-color: #bae6fd;
  box-shadow: 0 2px 0 #bae6fd;
}

.tab-btn:not(.active):hover {
  background: #f1f5f9;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 800;
  color: #1e293b;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  background: #f8fafc;
  color: #1e293b;
  transition: border-color 0.15s, background 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: #1cb0f6;
  background: #ffffff;
}

.btn-primary {
  background: #1cb0f6;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 4px 0 #0284c7;
  transition: transform 0.1s, box-shadow 0.1s;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 0 #0284c7;
}

.btn-primary:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #0284c7;
}

.btn-primary:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: 0 4px 0 #cbd5e1;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  background: #fee2e2;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  text-align: center;
  border: 2px solid #fca5a5;
}
</style>