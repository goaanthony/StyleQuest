import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { jwt } from "@elysiajs/jwt";
import { join } from "path";
import { cors } from "@elysiajs/cors";
import Database from "bun:sqlite";
import { readFileSync } from "fs";
import cssModules from "../src/data/cssModules.json";
import { checkExerciseFlexible } from "./cssNormalizer"; // ← IMPORT

const port = Number(process.env.PORT ?? 3000);

// ─── UTILS CSS ─────────────────────────────────────────────────────────────
interface ExRecord { id: string; targetCSS: string; hints: string[] }
interface Notion    { exercises: ExRecord[] }
interface Module    { notions: Notion[] }

function findExercise(id: string): ExRecord | undefined {
  for (const mod of (cssModules as Module[])) {
    for (const notion of mod.notions) {
      const found = notion.exercises.find((e) => e.id === id);
      if (found) return found;
    }
  }
  return undefined;
}

// ─── DATABASE SETUP ──────────────────────────────────────────────────────────
const db = new Database(join(import.meta.dir, "stylequest.sqlite"), { create: true });

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    xp_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_winstreak INTEGER DEFAULT 0,
    longest_winstreak INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_streak_date DATE
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    exercise_id TEXT,
    xp_gained INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS level_ups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    previous_level INTEGER,
    new_level INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  const dbSqlPath = join(import.meta.dir, "db.sql");
  const initSql = readFileSync(dbSqlPath, "utf-8");
  db.exec(initSql);
  console.log("✅ Custom db.sql loaded");
} catch (e: any) {}

const app = new Elysia();

app.use(cors());

app.use(
  jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'super-secret-key-stylequest',
  })
);

// ── AUTHENTIFICATION ─────────────────────────────────────────────────────────
app.post('/api/register', async ({ body, set, jwt }) => {
  const { username, email, password } = body as any;
  try {
    const passwordHash = await Bun.password.hash(password);
    db.query(`INSERT INTO users (username, email, password_hash) VALUES ($username, $email, $hash)`).run({ $username: username, $email: email, $hash: passwordHash });
    const user = db.query(`SELECT id, username, email, current_winstreak, longest_winstreak, xp_points, lessons_completed FROM users WHERE username = $username`).get({ $username: username }) as any;
    const token = await jwt.sign({ userId: user.id });
    return { success: true, user, session: { token, userId: user.id } };
  } catch (error) {
    set.status = 400;
    return { success: false, error: "Nom d'utilisateur ou email déjà utilisé." };
  }
});

app.post('/api/login', async ({ body, set, jwt }) => {
  const { username, password } = body as any;
  const user = db.query(`SELECT * FROM users WHERE username = $username`).get({ $username: username }) as any;
  if (!user || !(await Bun.password.verify(password, user.password_hash))) {
    set.status = 401;
    return { success: false, error: 'Identifiants incorrects' };
  }
  const token = await jwt.sign({ userId: user.id });
  const { password_hash, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword, session: { token, userId: user.id } };
});

// ── RÉCUPÉRER PROFIL & PROGRESSION ─────────────────────────────────────────
app.get('/api/me', async ({ headers, set, jwt }) => {
  const auth = headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) { set.status = 401; return { success: false, error: "Non autorisé" }; }
  
  const payload = await jwt.verify(token);
  if (!payload) { set.status = 401; return { success: false, error: "Token invalide" }; }

  const user = db.query(`SELECT id, username, email, current_winstreak, longest_winstreak, xp_points, lessons_completed, last_streak_date FROM users WHERE id = $id`).get({ $id: payload.userId });
  return { success: true, user };
});

app.get('/api/progress', async ({ headers, set, jwt }) => {
  const auth = headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) { set.status = 401; return { success: false }; }
  
  const payload = await jwt.verify(token);
  if (!payload) { set.status = 401; return { success: false }; }

  const progress = db.query("SELECT exercise_id FROM user_progress WHERE user_id = ?").all(payload.userId) as any[];
  const completedIds = progress.map(p => p.exercise_id);
  
  return { success: true, completedIds };
});

// ── VÉRIFICATION CSS (AVEC NORMALISEUR FLEXIBLE) ────────────────────────────
app.post("/api/exercise/check", ({ body }) => {
  const { exerciseId, userCSS } = body as any;
  const exercise = findExercise(exerciseId);
  
  if (!exercise) {
    return { 
      success: false, 
      message: "Exercice introuvable.", 
      errors: [], 
      warnings: [],
      tip: "" 
    };
  }

  // Utiliser le normaliseur flexible
  const result = checkExerciseFlexible(exercise.targetCSS, userCSS);
  
  return {
    success: result.success,
    message: result.message,
    errors: result.errors,
    warnings: result.warnings,
    tip: result.tip,
  };
});

// ── SAUVEGARDE & LOGIQUE WINSTREAK (SÉCURISÉ) ──────────────────────────────
app.post("/api/scores", async ({ body, headers, set, jwt }) => {
  const auth = headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) { set.status = 401; return { success: false, error: "Connecte-toi pour sauvegarder." }; }

  const payload = await jwt.verify(token);
  if (!payload) { set.status = 401; return { success: false, error: "Session expirée." }; }

  const { exerciseId, xpGained } = body as any;
  const user = db.query("SELECT * FROM users WHERE id = ?").get(payload.userId) as any;
  if (!user) { set.status = 404; return { success: false, error: "Utilisateur introuvable." }; }

  const existingProgress = db.query("SELECT * FROM user_progress WHERE user_id = ? AND exercise_id = ?").get(user.id, exerciseId);

  let newXP = user.xp_points || 0;
  let newStreak = user.current_winstreak || 0;
  let newLongestStreak = user.longest_winstreak || 0;
  let lessonsCompleted = user.lessons_completed || 0;
  let lastStreakDate = user.last_streak_date;

  // Calcul du jour actuel (UTC)
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  // LOGIQUE WINSTREAK
  if (lastStreakDate !== today) {
    if (lastStreakDate === yesterday) {
      newStreak += 1; // A joué hier, on incrémente
    } else {
      newStreak = 1; // A raté un jour, on remet à 1
    }
    if (newStreak > newLongestStreak) newLongestStreak = newStreak;
    lastStreakDate = today;
  }

  if (!existingProgress) {
    db.query("INSERT INTO user_progress (user_id, exercise_id, xp_gained) VALUES (?, ?, ?)").run(user.id, exerciseId, xpGained);
    newXP += xpGained;
    lessonsCompleted += 1;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    db.query(`UPDATE users SET xp_points = ?, current_level = ?, current_winstreak = ?, longest_winstreak = ?, lessons_completed = ?, last_streak_date = ?, updated_at = ? WHERE id = ?`)
      .run(newXP, newLevel, newStreak, newLongestStreak, lessonsCompleted, lastStreakDate, new Date().toISOString(), user.id);
  } else {
    // S'il a déjà fait l'exo, on met juste à jour sa winstreak si besoin
    db.query(`UPDATE users SET current_winstreak = ?, longest_winstreak = ?, last_streak_date = ? WHERE id = ?`)
      .run(newStreak, newLongestStreak, lastStreakDate, user.id);
  }

  const updatedUser = db.query("SELECT id, username, email, current_winstreak, longest_winstreak, xp_points, lessons_completed FROM users WHERE id = ?").get(user.id);
  return { success: true, message: `Sauvegardé !`, user: updatedUser };
});

app.listen(port);
console.log(`🚀 API listening on http://localhost:${app.server?.port}`);