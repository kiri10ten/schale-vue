import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/student',
      name: 'studentlistview',
      component: () => import('../views/StudentListView.vue')
    },
    {
      path: '/student/:studentid',
      name: 'studentview',
      component: () => import('../views/StudentView.vue')
    },
    {
      path: '/item/:itemid',
      name: 'itemview',
      component: () => import('../views/ItemView.vue')
    },
    {
      path: '/equipment/:equipmentid',
      name: 'equipmentview',
      component: () => import('../views/ItemView.vue')
    },
    {
      path: '/furniture/:furnitureid',
      name: 'furnitureview',
      component: () => import('../views/ItemView.vue')
    }
  ]
})

export default router
