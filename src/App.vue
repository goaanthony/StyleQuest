<template>
  <div class="app-shell">
    <Navbar />

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import Navbar from "@/components/layout/Navbar.vue";
import { useUserStore } from "@/stores/useUserStore";
import { useSyncManager } from "@/composables/useSyncManager";

const userStore = useUserStore();
const { setupSync } = useSyncManager();

onMounted(() => {
  // Initialiser les données utilisateur
  userStore.loadFromPersistence();
  
  // Commencer la synchronisation automatique (tous les 30s)
  setupSync(30000);
  
  console.log(`👤 Bienvenue, ${userStore.pseudo}!`);
});
</script>

<style scoped>
.app-main {
  padding-top: 80px; /* leave space for fixed navbar (72px height + 8px gap) */
  padding-left: 24px;
  padding-right: 24px;
}
</style>
