import { Elysia } from 'elysia';

const app = new Elysia()
  .get('/', () => Bun.file('public/index.html'))
  .get('/styles.css', () => Bun.file('public/styles.css'))
  .get('/script.js', () => Bun.file('public/script.js'))
  .listen(3000);

console.log(`🎨 StyleQuest server running at http://localhost:${app.server?.port}`);
