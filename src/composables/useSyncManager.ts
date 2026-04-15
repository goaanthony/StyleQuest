import { useUserStore } from "@/stores/useUserStore";
import { useLeaderboardStore } from "@/stores/useLeaderboardStore";
import { onMounted, onBeforeUnmount } from "vue";

export function useSyncManager() {
  const userStore = useUserStore();
  const leaderboardStore = useLeaderboardStore();

  let syncInterval: NodeJS.Timeout | null = null;

  // Synchroniser automatiquement tous les 30 secondes
  function startAutoSync(intervalMs: number = 30000) {
    if (syncInterval) clearInterval(syncInterval);

    syncInterval = setInterval(async () => {
      // Sync avec le serveur
      const result = await userStore.syncWithServer();

      if (result.success && result.synced && result.synced > 0) {
        console.log(`✅ Synchronisation réussie: ${result.synced} score(s) enregistré(s)`);
        // Invalider le cache du leaderboard pour une mise à jour
        leaderboardStore.invalidateCache();
      }
    }, intervalMs);

    // Charger les données utilisateur immédiatement
    userStore.loadFromPersistence();
    userStore.fetchUserData();
  }

  function stopAutoSync() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }

  // Setup hook pour les composants
  function setupSync(intervalMs?: number) {
    onMounted(() => startAutoSync(intervalMs));
    onBeforeUnmount(() => stopAutoSync());
  }

  return {
    startAutoSync,
    stopAutoSync,
    setupSync,
  };
}
