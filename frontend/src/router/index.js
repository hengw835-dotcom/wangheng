import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue')
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
