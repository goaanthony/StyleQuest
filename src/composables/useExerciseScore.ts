import { useUserStore } from "@/stores/useUserStore";
import { useLeaderboardStore } from "@/stores/useLeaderboardStore";

export function useExerciseScore() {
  const userStore = useUserStore();
  const leaderboardStore = useLeaderboardStore();

  /**
   * Enregistrer un score d'exercice
   * Ajoute le XP localement et marque pour sync
   */
  async function submitExerciseScore(
    exerciseId: string,
    moduleId: number,
    notionId: string,
    xpGained: number
  ) {
    try {
      // Ajouter localement
      userStore.addLocalScore(exerciseId, moduleId, notionId, xpGained);

      // Essayer de sync immédiatement
      const result = await userStore.syncWithServer();

      if (result.success && result.synced && result.synced > 0) {
        // Invalider le cache du leaderboard
        leaderboardStore.invalidateCache();

        return {
          success: true,
          message: `+${xpGained} XP ! 🎉`,
          synced: true,
        };
      } else if (result.success) {
        return {
          success: true,
          message: `+${xpGained} XP enregistré localement (sync en attente)`,
          synced: false,
        };
      } else {
        return {
          success: true,
          message: `+${xpGained} XP (sync échouée, réessai en cours...)`,
          synced: false,
        };
      }
    } catch (e) {
      console.error("Error submitting exercise score:", e);
      return {
        success: false,
        message: "Erreur lors de l'enregistrement",
        synced: false,
      };
    }
  }

  return {
    submitExerciseScore,
  };
}
