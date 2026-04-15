// Types pour le système de progression
export interface User {
  id: number;
  pseudo: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailySession {
  id: number;
  user_id: number;
  session_date: string;
  xp_earned: number;
  exercises_completed: number;
  created_at: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  exercise_id: string;
  xp_gained: number;
  completed_at: string;
}

export interface CompletedModule {
  id: number;
  user_id: number;
  module_id: number;
  completed_at: string;
}

export interface CompletedNotion {
  id: number;
  user_id: number;
  module_id: number;
  notion_id: string;
  completed_at: string;
}

export interface LevelUp {
  id: number;
  user_id: number;
  previous_level: number;
  new_level: number;
  achieved_at: string;
}

// Types pour l'API
export interface ScoreSubmission {
  pseudo: string;
  exerciseId: string;
  moduleId: number;
  notionId: string;
  xpGained: number;
  timestamp: string;
}

export interface SyncPayload {
  pseudo: string;
  sessions: DailySession[];
  progress: UserProgress[];
  completedModules: CompletedModule[];
  completedNotions: CompletedNotion[];
}

export interface LeaderboardEntry {
  rank: number;
  pseudo: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
