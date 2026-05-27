import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { jwt } from "@elysiajs/jwt";
import { join } from "path";
import Database from "bun:sqlite";
import { readFileSync } from "fs";
import cssModules from "../src/data/cssModules.json";

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

function parseAllDeclarations(css: string): Record<string, string> {
  const result: Record<string, string> = {};
  const cleaned    = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blockRegex = /[^{]*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(cleaned)) !== null) {
    for (const decl of match[1].split(";")) {
      const idx = decl.indexOf(":");
      if (idx === -1) continue;
      const prop = decl.slice(0, idx).trim().toLowerCase();
      const val  = decl.slice(idx + 1).trim().toLowerCase().replace(/\s+/g, " ");
      if (prop && val) result[prop] = val;
    }
  }
  return result;
}

// ─── DATABASE SETUP ──────────────────────────────────────────────────────────
// Utilisation d'un fichier persistant au lieu de :memory: pour garder les comptes
const db = new Database("stylequest.sqlite", { create: true });

// Création de la table unifiée pour l'Auth et les Scores
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// Tentative de charger ton ancien db.sql si besoin
try {
  const dbSqlPath = join(import.meta.dir, "db.sql");
  const initSql = readFileSync(dbSqlPath, "utf-8");
  db.exec(initSql);
  console.log("✅ Custom db.sql loaded");
} catch (e: any) {
  console.log("ℹ️ No extra db.sql found or loaded (using default schema).");
}

// ─── RATE LIMITING ───────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }
  return false;
}

// ─── APP ELYSIA ─────────────────────────────────────────────────────────────
const app = new Elysia();

app.onAfterHandle(({ set }) => {
  set.headers["Access-Control-Allow-Origin"]  = "*";
  set.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
  set.headers["Access-Control-Allow-Headers"] = "content-type, authorization";
});

app.options("/*", ({ set }) => {
  set.status = 204;
  set.headers["Access-Control-Allow-Origin"]  = "*";
  set.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
  set.headers["Access-Control-Allow-Headers"] = "content-type, authorization";
  return null;
});

// Plugin JWT
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
    
    db.query(`INSERT INTO users (username, email, password_hash) VALUES ($username, $email, $hash)`)
      .run({ $username: username, $email: email, $hash: passwordHash });
      
    const user = db.query(`SELECT id, username, email, current_winstreak, longest_winstreak, xp_points, lessons_completed, created_at FROM users WHERE username = $username`)
      .get({ $username: username }) as any;

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

// ── ROUTES CSS & SCORES ──────────────────────────────────────────────────────

app.post("/api/exercise/check", ({ body }) => {
  const { exerciseId, userCSS } = body as any;
  const exercise = findExercise(exerciseId);

  if (!exercise) return { success: false, message: "Exercice introuvable.", errors: [], tip: "" };

  const target = parseAllDeclarations(exercise.targetCSS);
  const parsed = parseAllDeclarations(userCSS);
  const errors: string[] = [];

  for (const [prop, targetVal] of Object.entries(target)) {
    const actual = parsed[prop];
    if (!actual) errors.push(`Propriété manquante : ajoute « ${prop} »`);
    else if (actual !== targetVal) errors.push(`« ${prop} » incorrect — attendu : « ${targetVal} »`);
  }

  if (errors.length === 0) return { success: true, message: "🎉 Parfait ! Beau travail !", errors: [], tip: "" };
  
  return {
    success: false,
    message: "Pas tout à fait… réessaie !",
    errors,
    tip: `Indice : vérifie la propriété « ${errors[0]?.match(/«\s*([^»]+)\s*»/)?.[1] ?? ""} »`,
  };
});

app.post("/api/scores", ({ body, request, set }) => {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  if (!checkRateLimit(ip, 10, 60000)) {
    set.status = 429;
    return { success: false, error: "Trop de requêtes. Réessaie dans une minute." };
  }

  try {
    const { username, exerciseId, xpGained } = body as any; // Remplacé pseudo par username

    if (!username || !exerciseId || !xpGained) {
      set.status = 400;
      return { success: false, error: "Données manquantes." };
    }

    const user = db.query("SELECT * FROM users WHERE username = ?").get(username) as any;
    if (!user) {
      set.status = 404;
      return { success: false, error: "Utilisateur introuvable." };
    }

    const existingProgress = db.query("SELECT * FROM user_progress WHERE user_id = ? AND exercise_id = ?").get(user.id, exerciseId);

    if (!existingProgress) {
      db.query("INSERT INTO user_progress (user_id, exercise_id, xp_gained) VALUES (?, ?, ?)").run(user.id, exerciseId, xpGained);

      const newXP = (user.xp_points || 0) + xpGained;
      const oldLevel = user.current_level || 1;
      const newLevel = Math.floor(newXP / 100) + 1;

      db.query("UPDATE users SET xp_points = ?, current_level = ?, updated_at = ? WHERE id = ?").run(newXP, newLevel, new Date().toISOString(), user.id);

      if (newLevel > oldLevel) {
        db.query("INSERT INTO level_ups (user_id, previous_level, new_level) VALUES (?, ?, ?)").run(user.id, oldLevel, newLevel);
      }
    }

    return {
      success: true,
      message: `+${xpGained} XP enregistrés !`,
      userXP: (user.xp_points || 0) + (existingProgress ? 0 : xpGained),
      userLevel: Math.floor(((user.xp_points || 0) + (existingProgress ? 0 : xpGained)) / 100) + 1,
    };
  } catch (e) {
    set.status = 500;
    return { success: false, error: "Erreur serveur lors de l'enregistrement." };
  }
});

app.get("/api/leaderboard", () => {
  try {
    const leaderboard = db.query(`SELECT username, xp_points, current_level, current_winstreak, longest_winstreak FROM users ORDER BY xp_points DESC, current_level DESC LIMIT 100`).all() as any[];
    return {
      success: true,
      data: leaderboard.map((user, idx) => ({
        rank: idx + 1,
        username: user.username,
        xp_points: user.xp_points,
        current_level: user.current_level,
        current_winstreak: user.current_winstreak,
        longest_winstreak: user.longest_winstreak,
      })),
    };
  } catch (e) {
    return { success: false, error: "Erreur lors du chargement du classement." };
  }
});

app.get("/health", () => ({ ok: true }));

if (process.env.SERVE_STATIC === "true") {
  app.use(staticPlugin({ assets: join(process.cwd(), "dist"), prefix: "/" }));
}

app.listen(port);
console.log(`🚀 API listening on http://localhost:${app.server?.port}`);