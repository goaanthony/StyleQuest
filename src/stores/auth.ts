import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('sq_user') || 'null'))
  const token = ref(localStorage.getItem('sq_token') || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const API_URL = 'http://localhost:3000/api'

  function saveSession(userData: any, sessionToken: string) {
    user.value = userData
    token.value = sessionToken
    localStorage.setItem('sq_user', JSON.stringify(userData))
    localStorage.setItem('sq_token', sessionToken)
  }

  // 👇 NOUVELLE FONCTION : Met à jour le state ET le localStorage proprement
  function updateUser(newData: any) {
    if (user.value) {
      user.value = { ...user.value, ...newData }
      localStorage.setItem('sq_user', JSON.stringify(user.value))
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user) {
          // On utilise la nouvelle fonction ici aussi
          updateUser(data.user)
        }
      } else {
        logout() // Token invalide ou expiré
      }
    } catch (e) {
      console.error('Erreur Fetch Profile:', e)
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      saveSession(data.user, data.session.token)
      return true
    } catch (e) { return false }
  }

  async function register(username: string, email: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      saveSession(data.user, data.session.token)
      return true
    } catch (e) { return false }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('sq_user')
    localStorage.removeItem('sq_token')
  }

  return { user, token, isAuthenticated, login, register, logout, fetchProfile, updateUser }
})