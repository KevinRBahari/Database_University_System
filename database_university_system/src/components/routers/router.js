import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/components/stores/auth'
import HomeView from '@/views/menuView/HomeView.vue'
import LoginView from '@/views/menuView/LoginView.vue'
import RegisterView from '@/views/menuView/RegisterView.vue'
import DashboardView from '@/views/menuView/DashboardView.vue'
import CoursesView from '@/views/functionView/CoursesView.vue'
import StudentsView from '@/views/functionView/StudentsView.vue'
import FacultyView from '@/views/functionView/FacultyView.vue'
import AdminView from '@/views/userView/AdminView.vue'
import NotFound from '@/views/functionView/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/courses',
      name: 'courses',
      component: CoursesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/students',
      name: 'students',
      component: StudentsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/faculty',
      name: 'faculty',
      component: FacultyView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',            
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
    }
  ]
})

//Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'dashboard' })
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
