<template>
  <div class="app-shell">
    <Navbar />

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from "@/views/Navbar.vue";
</script>

<style scoped>
.app-main {
  padding-top: 80px; /* leave space for fixed navbar (72px height + 8px gap) */
  padding-left: 24px;
  padding-right: 24px;
}
</style>
