import { createRouter, createWebHashHistory } from "vue-router";

import HomePage from "@/views/HomePage.vue";
import ExercisePage from "@/views/ExercisePage.vue";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: HomePage },
    { path: "/exercises", component: ExercisePage },
  ],
});
