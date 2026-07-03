import { apiPath } from './api-path.js'
import { apiClient } from './http.js'
import {
  buildTaskProgressParams,
  createIdempotencyKey,
  createTextBodyConfig,
  toAuthSessionDto,
  toCapabilitiesDto,
  toMachineDto,
  toSensorDataDto,
  toTaskDto
} from './api-contracts.js'
import { unwrapApiResponse } from './request.js'

export {
  CONTROL_COMMANDS,
  MACHINE_STATUSES,
  TASK_STATUSES,
  buildTaskProgressParams,
  createIdempotencyKey,
  createTextBodyConfig,
  toAuthSessionDto,
  toCapabilitiesDto,
  toMachineDto,
  toSensorDataDto,
  toTaskDto
} from './api-contracts.js'

export const authApi = {
  async login(username, password, config) {
    const data = unwrapApiResponse(await apiClient.post(apiPath('/auth/token'), { username, password }, config))
    return toAuthSessionDto(data)
  }
}

export const systemApi = {
  async getCapabilities(config) {
    return toCapabilitiesDto(unwrapApiResponse(await apiClient.get(apiPath('/capabilities'), config)))
  }
}

export const machineApi = {
  async list(config) {
    const data = unwrapApiResponse(await apiClient.get(apiPath('/machines'), config))
    return Array.isArray(data) ? data.map(toMachineDto) : []
  },
  async create(machine, config) {
    return toMachineDto(unwrapApiResponse(await apiClient.post(apiPath('/machines'), machine, config)))
  },
  async update(machineId, machine, config) {
    return toMachineDto(unwrapApiResponse(await apiClient.put(apiPath(`/machines/${machineId}`), machine, config)))
  },
  async updateStatus(machineId, status, config) {
    return toMachineDto(
      unwrapApiResponse(await apiClient.put(apiPath(`/machines/${machineId}/status`), status, createTextBodyConfig(config)))
    )
  },
  async delete(machineId, config) {
    return unwrapApiResponse(await apiClient.delete(apiPath(`/machines/${machineId}`), config))
  }
}

export const taskApi = {
  async list(config) {
    const data = unwrapApiResponse(await apiClient.get(apiPath('/tasks'), config))
    return Array.isArray(data) ? data.map(toTaskDto) : []
  },
  async create(task, config) {
    return toTaskDto(unwrapApiResponse(await apiClient.post(apiPath('/tasks'), task, config)))
  },
  async updateStatus(taskId, status, config) {
    return toTaskDto(
      unwrapApiResponse(await apiClient.put(apiPath(`/tasks/${taskId}/status`), status, createTextBodyConfig(config)))
    )
  },
  async updateProgress(taskId, completedArea, config = {}) {
    return toTaskDto(
      unwrapApiResponse(
        await apiClient.put(apiPath(`/tasks/${taskId}/progress`), null, {
          ...config,
          ...buildTaskProgressParams(completedArea)
        })
      )
    )
  },
  async delete(taskId, config) {
    return unwrapApiResponse(await apiClient.delete(apiPath(`/tasks/${taskId}`), config))
  }
}

export const sensorDataApi = {
  async listMachines(config) {
    const data = unwrapApiResponse(await apiClient.get(apiPath('/sensor-data/machines'), config))
    return Array.isArray(data) ? data.map(String) : []
  },
  async listByMachine(machineId, config) {
    const data = unwrapApiResponse(await apiClient.get(apiPath(`/sensor-data/machine/${machineId}`), config))
    return Array.isArray(data) ? data.map(toSensorDataDto) : []
  },
  async listByMachineAndType(machineId, sensorType, config) {
    const data = unwrapApiResponse(await apiClient.get(apiPath(`/sensor-data/machine/${machineId}/type/${sensorType}`), config))
    return Array.isArray(data) ? data.map(toSensorDataDto) : []
  },
  async listByTimeRange(machineId, start, end, config = {}) {
    const data = unwrapApiResponse(
      await apiClient.get(apiPath(`/sensor-data/machine/${machineId}/time-range`), {
        ...config,
        params: {
          ...(config.params || {}),
          start,
          end
        }
      })
    )
    return Array.isArray(data) ? data.map(toSensorDataDto) : []
  },
  async create(sensorData, config) {
    return toSensorDataDto(unwrapApiResponse(await apiClient.post(apiPath('/sensor-data'), sensorData, config)))
  },
  async delete(id, config) {
    return unwrapApiResponse(await apiClient.delete(apiPath(`/sensor-data/${id}`), config))
  }
}

export const aiVisionApi = {
  async detect(image, config = {}) {
    const body = new FormData()
    body.append('image', image)
    const data = unwrapApiResponse(await apiClient.post(apiPath('/ai-vision/detect'), body, config))
    return Array.isArray(data) ? data : []
  },
  async getYieldDistribution(fieldId, config) {
    return unwrapApiResponse(await apiClient.get(apiPath(`/ai-vision/yield-distribution/${fieldId}`), config))
  }
}

export const sensorSimulatorApi = {
  async getStatus(config) {
    return unwrapApiResponse(await apiClient.get(apiPath('/sensor-simulator/status'), config))
  },
  async start(machineId, config = {}) {
    return unwrapApiResponse(
      await apiClient.post(apiPath('/sensor-simulator/start'), null, {
        ...config,
        params: { ...(config.params || {}), machineId }
      })
    )
  },
  async stop(config) {
    return unwrapApiResponse(await apiClient.post(apiPath('/sensor-simulator/stop'), null, config))
  },
  async publishOnce(machineId, config = {}) {
    return unwrapApiResponse(
      await apiClient.post(apiPath('/sensor-simulator/publish-once'), null, {
        ...config,
        params: { ...(config.params || {}), machineId }
      })
    )
  },
  async publish(reading, config) {
    return unwrapApiResponse(await apiClient.post(apiPath('/sensor-simulator/publish'), reading, config))
  }
}

export const emqxApi = {
  async getStatus(config) {
    return unwrapApiResponse(await apiClient.get(apiPath('/emqx/status'), config))
  },
  async listAudits(config) {
    const data = unwrapApiResponse(await apiClient.get(apiPath('/emqx/control-audits'), config))
    return Array.isArray(data) ? data : []
  },
  async getAuditByCommand(commandId, config = {}) {
    return unwrapApiResponse(
      await apiClient.get(apiPath('/emqx/control-audits/by-command'), {
        ...config,
        params: {
          ...(config.params || {}),
          commandId
        }
      })
    )
  },
  async sendControl(machineId, command, parameters = {}, config = {}) {
    return unwrapApiResponse(
      await apiClient.post(
        apiPath(`/emqx/machines/${machineId}/control`),
        { command, parameters },
        {
          ...config,
          headers: {
            ...(config.headers || {}),
            'Idempotency-Key': config.idempotencyKey || createIdempotencyKey(machineId, command)
          }
        }
      )
    )
  }
}
