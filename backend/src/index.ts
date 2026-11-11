import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { staticPlugin } from "@elysiajs/static"
import { authRoutes } from "./routes/auth"
import { progressRoutes } from "./routes/progress"
import { scoreRoutes } from "./routes/scores"
import { exerciseRoutes } from "./routes/exercise"
import { PORT } from "./config"

const app = new Elysia()
  .use(cors())
  .use(staticPlugin())
  .use(authRoutes)
  .use(progressRoutes)
  .use(scoreRoutes)
  .use(exerciseRoutes)
  .listen(PORT)

console.log(`🚀 API listening on http://localhost:${app.server?.port}`)
