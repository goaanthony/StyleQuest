<template>
  <SplashScreen />

  <div v-if="appStore.splashComplete" class="app-layout">
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import SplashScreen from '@/views/SplashScreen.vue'

const appStore = useAppStore()
const authStore = useAuthStore()
const progressStore = useProgressStore()

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await authStore.fetchProfile()
    await progressStore.fetchProgress()
  }
})
</script>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>