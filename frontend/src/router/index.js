import { createRouter, createWebHistory } from 'vue-router'

// 레이아웃
import AppShell from '@/components/AppShell.vue'

// 페이지
import LoginView from '@/views/LoginView.vue'
import DiaryView from '@/views/DiaryView.vue'
import HomeroomView from '@/views/HomeroomView.vue'
import StudentDetailView from '@/views/StudentDetailView.vue'
import SubjectView from '@/views/SubjectView.vue'
import TaskView from '@/views/TaskView.vue'
import AdminView from '@/views/AdminView.vue'
import ClubView from '@/views/ClubView.vue'
import ClubActivityView from '@/views/ClubActivityView.vue'
import ClubNotesView from '@/views/ClubNotesView.vue'
import ClubBudgetView from '@/views/ClubBudgetView.vue'

// 인증 스토어
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 로그인
    { path: '/login', name: 'login', component: LoginView },

    // 로그인 후 사용하는 레이아웃
    {
      path: '/',
      component: AppShell,
      children: [
        { path: '', redirect: '/diary' },
        { path: 'diary', name: 'diary', component: DiaryView },
        { path: 'homeroom', name: 'homeroom', component: HomeroomView },
        {
          path: 'homeroom/:hakbun',
          name: 'student-detail',
          component: StudentDetailView,
          props: true
        },
        { path: 'subject', name: 'subject', component: SubjectView },
        { path: 'task', name: 'task', component: TaskView },
        { path: 'club', name: 'club', component: ClubView },
        { path: 'club/activity/:id', name: 'club-activity', component: ClubActivityView },
        { path: 'club/notes', name: 'club-notes', component: ClubNotesView },
        { path: 'club/budget', name: 'club-budget', component: ClubBudgetView },
        { path: 'admin', name: 'admin', component: AdminView },
      ],
    },
  ],
})

// ---- 라우터 가드: 로그인 안 한 경우 ----
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.name === 'login') return true
  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
