import { defineStore } from "pinia";
import { ref, computed } from "vue";

// Configuration API - utilise la variable d'environnement ou port local
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Récupère ou crée une pseudo à partir de localStorage
function getOrCreatePseudo(): string {
  let pseudo = localStorage.getItem("stylequest_pseudo");
  if (!pseudo) {
    // Génère une pseudo aléatoire pseudonyme
    const adjectives = ["Swift", "Bold", "Keen", "Smart", "Clever", "Quick", "Bright"];
    const animals = ["Fox", "Eagle", "Shark", "Puma", "Falcon", "Lynx", "Tiger"];
    const num = Math.floor(Math.random() * 1000);
    pseudo = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
      animals[Math.floor(Math.random() * animals.length)]
    }${num}`;
    localStorage.setItem("stylequest_pseudo", pseudo);
  }
  return pseudo;
}

export const useUserStore = defineStore("user", () => {
  const pseudo = ref(getOrCreatePseudo());
  const totalXP = ref(0);
  const currentLevel = ref(1);
  const currentStreak = ref(0);
  const longestStreak = ref(0);

  // Données locales pour la synchronisation
  const pendingScores = ref<
    {
      exerciseId: string;
      moduleId: number;
      notionId: string;
      xpGained: number;
      timestamp: string;
    }[]
  >([]);

  const level = computed(() => Math.floor(totalXP.value / 100) + 1);

  // Ajouter un score local (avant sync)
  function addLocalScore(
    exerciseId: string,
    moduleId: number,
    notionId: string,
    xpGained: number
  ) {
    totalXP.value += xpGained;
    currentLevel.value = level.value;

    // Ajouter aux données en attente de sync
    pendingScores.value.push({
      exerciseId,
      moduleId,
      notionId,
      xpGained,
      timestamp: new Date().toISOString(),
    });

    // Persister dans localStorage
    saveToPersistence();
  }

  // Charger depuis localStorage
  function loadFromPersistence() {
    const saved = localStorage.getItem("stylequest_user_data");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        totalXP.value = data.totalXP || 0;
        currentLevel.value = data.currentLevel || 1;
        currentStreak.value = data.currentStreak || 0;
        longestStreak.value = data.longestStreak || 0;
        pendingScores.value = data.pendingScores || [];
      } catch (e) {
        console.error("Failed to load user data from localStorage:", e);
      }
    }
  }

  // Sauvegarder dans localStorage
  function saveToPersistence() {
    localStorage.setItem(
      "stylequest_user_data",
      JSON.stringify({
        totalXP: totalXP.value,
        currentLevel: currentLevel.value,
        currentStreak: currentStreak.value,
        longestStreak: longestStreak.value,
        pendingScores: pendingScores.value,
      })
    );
  }

  // Synchroniser avec le serveur
  async function syncWithServer() {
    if (pendingScores.value.length === 0) {
      return { success: true, message: "Rien à synchroniser." };
    }

    try {
      const results = [];
      for (const score of pendingScores.value) {
        const response = await fetch(`${API_URL}/api/scores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pseudo: pseudo.value,
            ...score,
          }),
        });

        const data = await response.json();
        if (data.success) {
          results.push({ success: true, score });
        } else {
          results.push({ success: false, score, error: data.error });
        }
      }

      // Vider les scores synchronisés
      const failedScores = results
        .filter((r) => !r.success)
        .map((r) => r.score);
      pendingScores.value = failedScores;

      saveToPersistence();

      return {
        success: results.filter((r) => r.success).length > 0,
        synced: results.filter((r) => r.success).length,
        failed: failedScores.length,
      };
    } catch (e) {
      console.error("Sync error:", e);
      return {
        success: false,
        error: "Erreur lors de la synchronisation.",
        synced: 0,
        failed: pendingScores.value.length,
      };
    }
  }

  // Charger les données utilisateur depuis le serveur
  async function fetchUserData() {
    try {
      const response = await fetch(`${API_URL}/api/user/${pseudo.value}`);
      const data = await response.json();

      if (data.success) {
        totalXP.value = data.data.total_xp;
        currentLevel.value = data.data.current_level;
        currentStreak.value = data.data.current_streak;
        longestStreak.value = data.data.longest_streak;
        saveToPersistence();
        return data.data;
      }
      return null;
    } catch (e) {
      console.error("Failed to fetch user data:", e);
      return null;
    }
  }

  return {
    pseudo,
    totalXP,
    currentLevel,
    currentStreak,
    longestStreak,
    level,
    pendingScores,
    addLocalScore,
    loadFromPersistence,
    saveToPersistence,
    syncWithServer,
    fetchUserData,
  };
});
