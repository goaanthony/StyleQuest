import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_BASE } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('sq_user') || 'null'))
  const token = ref(localStorage.getItem('sq_token') || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function saveSession(userData: any, sessionToken: string) {
    user.value = userData
    token.value = sessionToken
    localStorage.setItem('sq_user', JSON.stringify(userData))
    localStorage.setItem('sq_token', sessionToken)
  }

  function updateUser(newData: any) {
    if (user.value) {
      user.value = { ...user.value, ...newData }
      localStorage.setItem('sq_user', JSON.stringify(user.value))
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user) updateUser(data.user)
      } else {
        logout()
      }
    } catch (e) {
      console.error('fetchProfile:', e)
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      saveSession(data.user, data.session.token)
      return true
    } catch { return false }
  }

  async function register(username: string, email: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      saveSession(data.user, data.session.token)
      return true
    } catch { return false }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('sq_user')
    localStorage.removeItem('sq_token')
  }

  return { user, token, isAuthenticated, login, register, logout, fetchProfile, updateUser }
})
