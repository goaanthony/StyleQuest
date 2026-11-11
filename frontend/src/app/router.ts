import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/auth', name: 'Auth', component: () => import('@/features/auth/AuthPage.vue') },
    { path: '/', name: 'Home', component: () => import('@/pages/HomePage.vue'), meta: { requiresAuth: true } },
    { path: '/pathway', name: 'Pathway', component: () => import('@/features/learning/pathway/PathwayPage.vue'), meta: { requiresAuth: true } },
    { path: '/profile', name: 'Profile', component: () => import('@/pages/ProfilePage.vue'), meta: { requiresAuth: true } },
    { path: '/lesson', name: 'Lesson', component: () => import('@/features/learning/lessons/LessonPage.vue'), meta: { requiresAuth: true } },
    { path: '/lessons', name: 'Lessons', component: () => import('@/features/learning/lessons/LessonLibraryPage.vue'), meta: { requiresAuth: true } },
    { path: '/exercises', name: 'Exercise', component: () => import('@/features/learning/exercises/ExercisePage.vue'), meta: { requiresAuth: true } }
  ]
})

router.beforeEach((to, _from, next) => {
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