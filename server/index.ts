import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { join } from "path";
import cssModules from "../src/data/cssModules.json";

const port = Number(process.env.PORT ?? 3000);

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

// ─── Multi-rule CSS parser ───────────────────────────────────────────────────

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

// ─── App ────────────────────────────────────────────────────────────────────
const app = new Elysia();

// Attach CORS headers to every response (needed for Tauri WebView → localhost)
app.onAfterHandle(({ set }) => {
  set.headers["Access-Control-Allow-Origin"]  = "*";
  set.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
  set.headers["Access-Control-Allow-Headers"] = "content-type";
});

// Handle OPTIONS pre-flight requests
app.options("/api/*", ({ set }) => {
  set.status = 204;
  set.headers["Access-Control-Allow-Origin"]  = "*";
  set.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
  set.headers["Access-Control-Allow-Headers"] = "content-type";
  return null;
});

// ── POST /api/exercise/check ─────────────────────────────────────────────────
app.post(
  "/api/exercise/check",
  ({ body }) => {
    const { exerciseId, userCSS } = body;
    const exercise = findExercise(exerciseId);

    if (!exercise) {
      return { success: false, message: "Exercice introuvable.", errors: [], tip: "" };
    }

    const target = parseAllDeclarations(exercise.targetCSS);
    const parsed = parseAllDeclarations(userCSS);
    const errors: string[] = [];

    for (const [prop, targetVal] of Object.entries(target)) {
      const actual = parsed[prop];
      if (!actual) {
        errors.push(`Propriété manquante : ajoute « ${prop} »`);
      } else if (actual !== targetVal) {
        errors.push(`« ${prop} » incorrect — attendu : « ${targetVal} »`);
      }
    }

    if (errors.length === 0) {
      return { success: true, message: "🎉 Parfait ! Beau travail !", errors: [], tip: "" };
    }
    return {
      success: false,
      message: "Pas tout à fait… réessaie !",
      errors,
      tip: `Indice : vérifie la propriété « ${errors[0]?.match(/«\s*([^»]+)\s*»/)?.[1] ?? ""} »`,
    };
  },
  {
    body: t.Object({
      exerciseId: t.String(),
      userCSS:    t.String(),
    }),
  }
);

// ── DATABASE SETUP ───────────────────────────────────────────────────────────
import Database from "bun:sqlite";
import { readFileSync } from "fs";

const db = new Database(":memory:"); // Use ":memory:" for testing, or "./stylequest.db" for persistence

// Try to read db.sql from relative path
try {
  const dbSqlPath = join(import.meta.dir, "db.sql");
  const initSql = readFileSync(dbSqlPath, "utf-8");
  db.exec(initSql);
  console.log("✅ Database schema loaded successfully");
} catch (e) {
  console.warn("⚠️  Failed to load db.sql, using in-memory DB without schema:", e.message);
}

// ── RATE LIMITING ────────────────────────────────────────────────────────────
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

// ── POST /api/scores ────────────────────────────────────────────────────────
app.post(
  "/api/scores",
  ({ body, request, set }) => {
    const ip = request.headers.get("x-forwarded-for") || request.ip || "unknown";

    if (!checkRateLimit(ip, 10, 60000)) {
      set.status = 429;
      return { success: false, error: "Trop de requêtes. Réessaie dans une minute." };
    }

    try {
      const { pseudo, exerciseId, moduleId, notionId, xpGained } = body as any;

      if (!pseudo || !exerciseId || !xpGained) {
        set.status = 400;
        return { success: false, error: "Données manquantes." };
      }

      // Upsert user or get existing
      let user = db.query("SELECT * FROM users WHERE pseudo = ?").get(pseudo) as any;

      if (!user) {
        const today = new Date().toISOString().split("T")[0];
        db.query(
          "INSERT INTO users (pseudo, total_xp, current_level, current_streak, last_activity_date) VALUES (?, ?, ?, ?, ?)"
        ).run(pseudo, xpGained, 1, 1, today);
        user = db.query("SELECT * FROM users WHERE pseudo = ?").get(pseudo) as any;
      }

      // Record exercise progress
      const existingProgress = db
        .query("SELECT * FROM user_progress WHERE user_id = ? AND exercise_id = ?")
        .get(user.id, exerciseId) as any;

      if (!existingProgress) {
        db.query("INSERT INTO user_progress (user_id, exercise_id, xp_gained) VALUES (?, ?, ?)")
          .run(user.id, exerciseId, xpGained);

        // Update user XP
        const newXP = user.total_xp + xpGained;
        const oldLevel = user.current_level;
        const newLevel = Math.floor(newXP / 100) + 1;

        db.query("UPDATE users SET total_xp = ?, current_level = ?, updated_at = ? WHERE id = ?")
          .run(newXP, newLevel, new Date().toISOString(), user.id);

        // Record level-up event if applicable
        if (newLevel > oldLevel) {
          db.query(
            "INSERT INTO level_ups (user_id, previous_level, new_level) VALUES (?, ?, ?)"
          ).run(user.id, oldLevel, newLevel);
        }
      }

      return {
        success: true,
        message: `+${xpGained} XP enregistrés !`,
        userXP: (user.total_xp || 0) + (existingProgress ? 0 : xpGained),
        userLevel: Math.floor(((user.total_xp || 0) + (existingProgress ? 0 : xpGained)) / 100) + 1,
      };
    } catch (e) {
      set.status = 500;
      console.error("Score submission error:", e);
      return { success: false, error: "Erreur serveur lors de l'enregistrement." };
    }
  },
  {
    body: t.Object({
      pseudo: t.String(),
      exerciseId: t.String(),
      moduleId: t.Number(),
      notionId: t.String(),
      xpGained: t.Number(),
    }),
  }
);

// ── GET /api/leaderboard ───────────────────────────────────────────────────
app.get("/api/leaderboard", () => {
  try {
    const leaderboard = db
      .query(
        `SELECT 
        pseudo, total_xp, current_level, current_streak, longest_streak
      FROM users
      ORDER BY total_xp DESC, current_level DESC
      LIMIT 100`
      )
      .all() as any[];

    return {
      success: true,
      data: leaderboard.map((user, idx) => ({
        rank: idx + 1,
        pseudo: user.pseudo,
        total_xp: user.total_xp,
        current_level: user.current_level,
        current_streak: user.current_streak,
        longest_streak: user.longest_streak,
      })),
    };
  } catch (e) {
    console.error("Leaderboard error:", e);
    return { success: false, error: "Erreur lors du chargement du classement." };
  }
});

// ── GET /api/user/:pseudo ───────────────────────────────────────────────────
app.get("/api/user/:pseudo", ({ params }) => {
  try {
    const user = db.query("SELECT * FROM users WHERE pseudo = ?").get(params.pseudo) as any;

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé." };
    }

    return { success: true, data: user };
  } catch (e) {
    return { success: false, error: "Erreur lors du chargement de l'utilisateur." };
  }
});

// Optional: serve static files (useful if you want to run it as a web server)
// Example: SERVE_STATIC=true bun run server
if (process.env.SERVE_STATIC === "true") {
  app.use(
    staticPlugin({
      assets: join(process.cwd(), "dist"),
      prefix: "/",
    })
  );
}

app.get("/health", () => ({ ok: true }));

app.listen(port);

console.log(`🚀 API listening on http://localhost:${app.server?.port}`);