import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('@/views/LogoutView.vue'),
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('@/views/UploadView.vue'),
    },
    {
      path: '/browser',
      name: 'browser',
      component: () => import('@/views/SearchView.vue'),
    },
    {
      path: '/random',
      name: 'random',
      component: () => import('@/views/RandomView.vue'),
    },
    {
      path: '/admin/users',
      name: 'users',
      component: () => import('@/views/admin/UsersView.vue'),
    },
    {
      path: '/admin/roles',
      name: 'roles',
      component: () => import('@/views/admin/RolesView.vue'),
    },
    {
      path: '/admin/tags',
      name: 'tags',
      component: () => import('@/views/admin/TagsView.vue'),
    },
    {
      path: '/admin/messages',
      name: 'MessagesManager',
      component: () => import('@/views/admin/MessagesView.vue'),
    },
  ],
})

export default router
