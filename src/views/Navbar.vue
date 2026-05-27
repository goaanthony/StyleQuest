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
        <RouterLink to="/pathway" class="tab-link tab-link--highlight" active-class="active">Parcours 🗺️</RouterLink>
      </div>
    </nav>

    <div class="navbar-right">
      <div class="winstreak-badge" title="Série actuelle">
        <span class="fire-icon">🔥</span>
        <span class="streak-count">{{ authStore.user?.current_winstreak || 0 }}</span>
      </div>
      
      <RouterLink to="/profile" class="profile-link" title="Mon Profil">
        <div class="profile-icon">👤</div>
      </RouterLink>

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

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.navbar-container {
  /* Correction du problème de superposition */
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #ffffff;
  
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.navbar-left { flex: 1; }

.navbar-logo {
  font-size: 1.5rem;
  font-weight: 900;
  color: #1cb0f6;
  text-decoration: none;
  letter-spacing: -0.5px;
}
.logo-dot { color: #0f172a; }

.navbar-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.nav-tabs {
  display: flex;
  gap: 1rem;
}

.tab-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  transition: all 0.2s;
}

.tab-link:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.tab-link.active {
  color: #1cb0f6;
  background: #e8f7fe;
}

.navbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.winstreak-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: white;
  border: 2px solid #e2e8f0;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-weight: 900;
  color: #ff9600;
  box-shadow: 0 2px 0 #e2e8f0;
}
.fire-icon { font-size: 1.1rem; }
.streak-count { font-size: 1rem; }

.profile-link { text-decoration: none; }
.profile-icon {
  width: 40px;
  height: 40px;
  background-color: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.15s;
}
.profile-link:hover .profile-icon {
  border-color: #1cb0f6;
  background-color: #e8f7fe;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}

@media (max-width: 768px) {
  .navbar-center { display: none; }
  .mobile-menu-btn { display: block; }
  .navbar-container { padding: 1rem; }
}
</style>