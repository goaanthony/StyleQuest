import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const splashComplete = ref(false)
  const isLoading = ref(true)

  function completeSplash(): void {
    splashComplete.value = true
    isLoading.value = false
  }

  return {
    splashComplete,
    isLoading,
    completeSplash,
  }
})
