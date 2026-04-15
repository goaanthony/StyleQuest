<template>
  <header class="navbar-container">
    <div class="navbar-left">
      <RouterLink to="/" class="navbar-logo">
        Style<span class="logo-dot">Quest</span>
      </RouterLink>
    </div>

    <nav class="navbar-center">
      <div class="nav-tabs">
        <RouterLink to="/" class="tab-link" active-class="active">Accueil</RouterLink>
        <RouterLink to="/exercises" class="tab-link tab-link--highlight" active-class="active">Exercices 🎯</RouterLink>
      </div>
    </nav>

    <div class="navbar-right">
      <RouterLink class="btn-simple btn-sm" to="/exercises">Commencer</RouterLink>
      <button class="mobile-menu-btn" aria-label="Menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts"></script>
