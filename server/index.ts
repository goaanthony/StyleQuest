import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { join } from "path";

const app = new Elysia()
  // .use(
  //   staticPlugin({
  //     assets: join(process.cwd(), "src/public"),
  //     prefix: "/",
  //   })
  // )
  // .get("/", () => Bun.file("src/public/pages/index.html"))
  
  // .get("/button", () => Bun.file("src/public/pages/button.html"))
  // .listen(3000);

console.log(`🚀 Server listening on http://localhost:${app.server?.port}`);