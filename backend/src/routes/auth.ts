import { Elysia } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { db } from "../db"
import { JWT_SECRET } from "../config"

export const authRoutes = new Elysia()
  .use(jwt({ name: 'jwt', secret: JWT_SECRET }))

  .post('/api/register', async ({ body, set, jwt }) => {
    const { username, email, password } = body as any
    try {
      const passwordHash = await Bun.password.hash(password)
      db.query(`INSERT INTO users (username, email, password_hash) VALUES ($username, $email, $hash)`)
        .run({ $username: username, $email: email, $hash: passwordHash })
      const user = db.query(
        `SELECT id, username, email, current_winstreak, longest_winstreak, xp_points, lessons_completed FROM users WHERE username = $username`
      ).get({ $username: username }) as any
      const token = await jwt.sign({ userId: user.id })
      return { success: true, user, session: { token, userId: user.id } }
    } catch {
      set.status = 400
      return { success: false, error: "Nom d'utilisateur ou email déjà utilisé." }
    }
  })

  .post('/api/login', async ({ body, set, jwt }) => {
    const { username, password } = body as any
    const user = db.query(`SELECT * FROM users WHERE username = $username`).get({ $username: username }) as any
    if (!user || !(await Bun.password.verify(password, user.password_hash))) {
      set.status = 401
      return { success: false, error: 'Identifiants incorrects' }
    }
    const token = await jwt.sign({ userId: user.id })
    const { password_hash, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword, session: { token, userId: user.id } }
  })

  .get('/api/me', async ({ headers, set, jwt }) => {
    const auth = headers.authorization
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) { set.status = 401; return { success: false, error: "Non autorisé" } }

    const payload = await jwt.verify(token)
    if (!payload) { set.status = 401; return { success: false, error: "Token invalide" } }

    const user = db.query(
      `SELECT id, username, email, current_winstreak, longest_winstreak, xp_points, lessons_completed, last_streak_date FROM users WHERE id = $id`
    ).get({ $id: payload.userId })
    return { success: true, user }
  })
