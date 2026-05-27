import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/auth', name: 'Auth', component: () => import('@/views/AuthPage.vue') },
    { path: '/', name: 'Home', component: () => import('@/views/HomePage.vue'), meta: { requiresAuth: true } },
    { path: '/pathway', name: 'Pathway', component: () => import('@/views/PathwayPage.vue'), meta: { requiresAuth: true } },
    { path: '/profile', name: 'Profile', component: () => import('@/views/ProfilePage.vue'), meta: { requiresAuth: true } },
    { path: '/lesson', name: 'Lesson', component: () => import('@/views/LessonPage.vue'), meta: { requiresAuth: true } },
    { path: '/lessons', name: 'Lessons', component: () => import('@/views/AllLessons.vue'), meta: { requiresAuth: true } },
    { path: '/exercises', name: 'Exercise', component: () => import('@/views/ExercisePage.vue'), meta: { requiresAuth: true } }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Auth' })
  } else if (to.name === 'Auth' && authStore.isAuthenticated) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router