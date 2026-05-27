import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Initialisation depuis le localStorage pour garder la session active
  const user = ref(JSON.parse(localStorage.getItem('sq_user') || 'null'))
  const token = ref(localStorage.getItem('sq_token') || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Assure-toi que ce port correspond bien à celui de ton serveur Elysia
  const API_URL = 'http://localhost:3000/api'

  function saveSession(userData: any, sessionToken: string) {
    user.value = userData
    token.value = sessionToken
    localStorage.setItem('sq_user', JSON.stringify(userData))
    localStorage.setItem('sq_token', sessionToken)
  }

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Identifiants incorrects')
      }

      saveSession(data.user, data.session.token)
      return true
    } catch (e) {
      console.error('Erreur Login:', e)
      return false
    }
  }

  async function register(username: string, email: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'inscription")
      }

      saveSession(data.user, data.session.token)
      return true
    } catch (e) {
      console.error('Erreur Register:', e)
      return false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('sq_user')
    localStorage.removeItem('sq_token')
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout
  }
})