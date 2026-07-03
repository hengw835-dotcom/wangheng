import { createRouter, createWebHashHistory } from 'vue-router'
import { resolveDefaultRouteForViewport } from './mobile-routing.js'

const routes = [
  {
    path: '/mobile',
    name: 'MobileDashboard',
    component: () => import('../views/MobileDashboard.vue')
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/integrated',
    name: 'Integrated',
    component: () => import('../views/IntegratedView.vue')
  },
  {
    path: '/tasks',
    name: 'TaskManagement',
    component: () => import('../views/TaskManagement.vue')
  },
  {
    path: '/machines',
    name: 'MachineManagement',
    component: () => import('../views/MachineManagement.vue')
  },
  {
    path: '/monitor',
    name: 'ControlSystem',
    component: () => import('../views/ControlSystem.vue')
  },
  {
    path: '/vision',
    name: 'AIVision',
    component: () => import('../views/AIVision.vue')
  },
  {
    path: '/sensors',
    name: 'SensorData',
    component: () => import('../views/SensorData.vue')
  },
  {
    path: '/simulator',
    name: 'SensorSimulator',
    component: () => import('../views/SensorSimulator.vue')
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/ReportsView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(to => {
  if (to.path === '/' && resolveDefaultRouteForViewport() === '/mobile') return '/mobile'
})

export default router
