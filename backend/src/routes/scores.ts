import { Elysia } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { db } from "../db"
import { JWT_SECRET } from "../config"

export const scoreRoutes = new Elysia()
  .use(jwt({ name: 'jwt', secret: JWT_SECRET }))

  .post('/api/scores', async ({ body, headers, set, jwt }) => {
    const auth = headers.authorization
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) { set.status = 401; return { success: false, error: "Connecte-toi pour sauvegarder." } }

    const payload = await jwt.verify(token)
    if (!payload) { set.status = 401; return { success: false, error: "Session expirée." } }

    const { exerciseId, xpGained } = body as any
    const user = db.query("SELECT * FROM users WHERE id = ?").get(payload.userId) as any
    if (!user) { set.status = 404; return { success: false, error: "Utilisateur introuvable." } }

    const existingProgress = db.query(
      "SELECT * FROM user_progress WHERE user_id = ? AND exercise_id = ?"
    ).get(user.id, exerciseId)

    let newXP = user.xp_points || 0
    let newStreak = user.current_winstreak || 0
    let newLongestStreak = user.longest_winstreak || 0
    let lessonsCompleted = user.lessons_completed || 0
    let lastStreakDate = user.last_streak_date

    const today = new Date().toISOString().split('T')[0]
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = yesterdayDate.toISOString().split('T')[0]

    if (lastStreakDate !== today) {
      newStreak = lastStreakDate === yesterday ? newStreak + 1 : 1
      if (newStreak > newLongestStreak) newLongestStreak = newStreak
      lastStreakDate = today
    }

    if (!existingProgress) {
      db.query("INSERT INTO user_progress (user_id, exercise_id, xp_gained) VALUES (?, ?, ?)")
        .run(user.id, exerciseId, xpGained)
      newXP += xpGained
      lessonsCompleted += 1
      const newLevel = Math.floor(newXP / 100) + 1
      db.query(`UPDATE users SET xp_points = ?, current_level = ?, current_winstreak = ?, longest_winstreak = ?, lessons_completed = ?, last_streak_date = ?, updated_at = ? WHERE id = ?`)
        .run(newXP, newLevel, newStreak, newLongestStreak, lessonsCompleted, lastStreakDate, new Date().toISOString(), user.id)
    } else {
      db.query(`UPDATE users SET current_winstreak = ?, longest_winstreak = ?, last_streak_date = ? WHERE id = ?`)
        .run(newStreak, newLongestStreak, lastStreakDate, user.id)
    }

    const updatedUser = db.query(
      "SELECT id, username, email, current_winstreak, longest_winstreak, xp_points, lessons_completed FROM users WHERE id = ?"
    ).get(user.id)
    return { success: true, message: 'Sauvegardé !', user: updatedUser }
  })
