import { defineStore } from "pinia";
import { ref } from "vue";

export interface LeaderboardEntry {
  rank: number;
  pseudo: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
}

// Configuration API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const useLeaderboardStore = defineStore("leaderboard", () => {
  const entries = ref<LeaderboardEntry[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastFetch = ref<number>(0);

  // Intervalle de cache (5 minutes)
  const CACHE_INTERVAL = 5 * 60 * 1000;

  // Charger le leaderboard depuis le serveur
  async function fetchLeaderboard() {
    // Éviter les requêtes trop fréquentes
    const now = Date.now();
    if (now - lastFetch.value < CACHE_INTERVAL && entries.value.length > 0) {
      return entries.value;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/api/leaderboard`);
      const data = await response.json();

      if (data.success) {
        entries.value = data.data || [];
        lastFetch.value = now;
        return data.data;
      } else {
        error.value = data.error || "Erreur lors du chargement du leaderboard.";
        return [];
      }
    } catch (e) {
      error.value = "Impossible de se connecter au serveur.";
      console.error("Leaderboard fetch error:", e);
      return [];
    } finally {
      loading.value = false;
    }
  }

  // Invalider le cache pour une mise à jour immédiate
  function invalidateCache() {
    lastFetch.value = 0;
  }

  return {
    entries,
    loading,
    error,
    fetchLeaderboard,
    invalidateCache,
  };
});
