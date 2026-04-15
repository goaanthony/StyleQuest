<template>
  <section>
    <h1>Boutons</h1>

    <div class="buttons">
      <button class="btn-simple btn-sm btn-red">Bouton Primaire</button>
      <button class="btn-simple btn-md">Bouton Medium</button>
      <button class="btn-simple btn-lg btn-white">Bouton Large</button>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}
</style>
