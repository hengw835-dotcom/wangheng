import { createPinia, defineStore } from 'pinia'
import { apiClient, installHttpInterceptors } from '../services/http'
import { describeApiError } from '../services/error'
import { authApi, machineApi, sensorDataApi, systemApi, taskApi } from '../services/api'
import {
  clearAuthSession,
  getAuthToken,
  getStoredRoles,
  getStoredUsername,
  setAuthSession
} from '../services/auth'
import { buildDashboardSnapshot } from '../utils/dashboardModel'

const pinia = createPinia()
export default pinia

installHttpInterceptors(apiClient)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getAuthToken(),
    username: getStoredUsername(),
    roles: getStoredRoles(),
    error: null,
    loading: false
  }),
  actions: {
    async login(username, password) {
      this.loading = true
      try {
        const session = await authApi.login(username, password)
        this.token = session.accessToken
        this.username = username
        this.roles = session.roles
        setAuthSession({ ...session, username })
        this.error = null
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.token = null
      this.username = null
      this.roles = []
      clearAuthSession()
    }
  }
})

export const useSystemStore = defineStore('system', {
  state: () => ({
    online: false,
    capabilities: {
      aiVision: 'unknown',
      navigation: 'unknown',
      control: 'unknown'
    },
    error: null
  }),
  actions: {
    async checkHealth() {
      try {
        this.capabilities = await systemApi.getCapabilities()
        this.online = true
        this.error = null
      } catch (error) {
        this.online = false
        this.error = describeApiError(error)
      }
    }
  }
})

export const useMachineStore = defineStore('machine', {
  state: () => ({
    machines: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchMachines() {
      this.loading = true
      try {
        this.machines = await machineApi.list()
        this.error = null
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async addMachine(machine) {
      try {
        const created = await machineApi.create(machine)
        this.machines.push(created)
        this.error = null
        return created
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      }
    },
    async updateMachineStatus(machineId, status) {
      try {
        const updated = await machineApi.updateStatus(machineId, status)
        const index = this.machines.findIndex(machine => machine.machineId === machineId)
        if (index !== -1) this.machines[index] = updated
        this.error = null
        return updated
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      }
    },
    async updateMachine(machine) {
      try {
        const updated = await machineApi.update(machine.machineId, machine)
        const index = this.machines.findIndex(item => item.machineId === machine.machineId)
        if (index !== -1) this.machines[index] = updated
        this.error = null
        return updated
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      }
    },
    async deleteMachine(machineId) {
      try {
        await machineApi.delete(machineId)
        this.machines = this.machines.filter(machine => machine.machineId !== machineId)
        this.error = null
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      }
    }
  }
})

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchTasks() {
      this.loading = true
      try {
        this.tasks = await taskApi.list()
        this.error = null
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async createTask(task) {
      try {
        const created = await taskApi.create(task)
        this.tasks.push(created)
        this.error = null
        return created
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      }
    },
    async updateTaskStatus(taskId, status) {
      try {
        const updated = await taskApi.updateStatus(taskId, status)
        const index = this.tasks.findIndex(task => task.taskId === taskId)
        if (index !== -1) this.tasks[index] = updated
        this.error = null
        return updated
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      }
    },
    async deleteTask(taskId) {
      try {
        await taskApi.delete(taskId)
        this.tasks = this.tasks.filter(task => task.taskId !== taskId)
        this.error = null
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      }
    }
  }
})

export const useSensorDataStore = defineStore('sensorData', {
  state: () => ({
    sensorData: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchSensorData(machineId) {
      this.loading = true
      try {
        this.sensorData = await sensorDataApi.listByMachine(machineId)
        this.error = null
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async addSensorData(data) {
      try {
        await sensorDataApi.create(data)
        this.error = null
      } catch (error) {
        this.error = describeApiError(error)
        throw error
      }
    }
  }
})

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    snapshot: buildDashboardSnapshot(),
    loading: false,
    error: null
  }),
  actions: {
    async load() {
      this.loading = true
      try {
        const [machines, tasks, capabilities] = await Promise.all([
          machineApi.list(),
          taskApi.list(),
          systemApi.getCapabilities()
        ])
        this.snapshot = buildDashboardSnapshot({ machines, tasks, capabilities })
        this.error = null
      } catch (error) {
        this.error = describeApiError(error)
        this.snapshot = buildDashboardSnapshot()
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
