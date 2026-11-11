import { Elysia } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { db } from "../db"
import { JWT_SECRET } from "../config"

export const progressRoutes = new Elysia()
  .use(jwt({ name: 'jwt', secret: JWT_SECRET }))

  .get('/api/progress', async ({ headers, set, jwt }) => {
    const auth = headers.authorization
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) { set.status = 401; return { success: false } }

    const payload = await jwt.verify(token)
    if (!payload) { set.status = 401; return { success: false } }

    const progress = db.query("SELECT exercise_id FROM user_progress WHERE user_id = ?").all(payload.userId) as any[]
    const completedIds = progress.map(p => p.exercise_id)
    return { success: true, completedIds }
  })
