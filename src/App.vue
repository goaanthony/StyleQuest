<template>
  <SplashScreen />

  <div v-if="appStore.splashComplete" class="app-layout">
    <Navbar v-if="showNavbar" />
    
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import SplashScreen from '@/views/SplashScreen.vue'
import Navbar from '@/views/Navbar.vue'

const appStore = useAppStore()
const route = useRoute()

const showNavbar = computed(() => {
  return !['Auth', 'Exercise'].includes(route.name as string)
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