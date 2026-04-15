<template>
  <section>
    <h1>Composant Card</h1>

    <h2>Tailles</h2>
    <div class="container">
      <div class="card card-sm">
        <h3>Card Small</h3>
        <p>Ceci est une petite carte.</p>
        <button class="btn-simple btn-sm">Action</button>
      </div>

      <div class="card card-md">
        <h3>Card Medium</h3>
        <p>
          Ceci est une carte de taille standard. Elle contient un peu plus de contenu pour l'exemple.
        </p>
        <button class="btn-simple btn-md">Action</button>
      </div>

      <div class="card card-lg">
        <h3>Card Large</h3>
        <p>
          Ceci est une grande carte. Idéale pour mettre en avant du contenu important avec plus d'espace.
        </p>
        <button class="btn-simple btn-lg">Action</button>
      </div>
    </div>

    <h2>Variantes</h2>
    <div class="container">
      <div class="card card-md card-blue">
        <h3>Card Blue</h3>
        <p>Une variante colorée.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.container {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: flex-start;
}
</style>
