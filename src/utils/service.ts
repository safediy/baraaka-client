import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
// import { ElMessage } from 'element-plus'
import { get, isEmpty, merge, trim } from 'lodash-es'
import { getToken, getTokenLocal } from './cache/cookies'
import { generateHmacHash, parseInitDataTelegram } from './helpers'
import { ENV } from '@/config/env'

function createService() {
  const service = axios.create()
  service.interceptors.request.use(
    (config) => config,
    // 发送失败
    (error) => Promise.reject(error)
  )
  service.interceptors.response.use(
    (response) => {
      return response?.data
    },
    (error) => {
      const status = get(error, 'response.status')
      const message = get(error, 'response.data.message')
      if (message && status !== 401) {
        // ElMessage.error(message)
        return Promise.reject(error)
      }
      switch (status) {
        case 400:
          error.message = 'Request error'
          break
        case 401:
          error.message = 'Unauthorized'
          break
        case 403:
          error.message = 'Access denied'
          break
        case 404:
          error.message = 'Request address error'
          break
        case 408:
          error.message = 'Request timeout'
          break
        case 500:
          error.message = 'Server internal error'
          break
        case 501:
          error.message = 'Service not implemented'
          break
        case 502:
          error.message = 'Gateway error'
          break
        case 503:
          error.message = 'Service unavailable'
          break
        case 504:
          error.message = 'Gateway timeout'
          break
        case 505:
          error.message = 'HTTP version not supported'
          break
        default:
          break
      }
      // ElMessage.error(error.message)
      return Promise.reject(error)
    }
  )
  return service
}

function createRequest(service: AxiosInstance) {
  return function <T>(config: AxiosRequestConfig): Promise<T> {
    const token = getToken() || getTokenLocal()
    const webApp = window.Telegram.WebApp

    // Format params for GET requests
    if (config.params?.s && (config.method === 'get' || config.method === 'GET')) {
      const rawS = config.params.s

      config.params = {
        ...config.params,
        s: typeof rawS === 'object' ? JSON.stringify(omitEmptyProperties(rawS)) : rawS
      }
    }

    // Process Telegram data
    const timestamp = Math.floor(Date.now() / 1000)
    const telegramUser = parseInitDataTelegram(webApp.initData)
    const apiSecret = import.meta.env.VITE_TELEGRAM_API_SECRET
    const headers = telegramUser
      ? {
        source: 'TELEGRAM',
        // bot_type: import.meta.env.VITE_BOT_TYPE,
        'x-chat-id': telegramUser?.id,
        'x-timestamp': timestamp,
        'x-apikey': generateHmacHash(`${telegramUser?.id}:${timestamp}`, apiSecret),
        'Content-Type': 'application/json'
      }
      : {
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json',
        source: 'CLIENT_WEB'
      }
    const defaultConfig = {
      headers,
      timeout: 100000,
      baseURL: ENV.BASE_API,
      withCredentials: true
    }
    return service(merge(defaultConfig, config))
  }
}

function omitEmptyProperties(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj

  if (Array.isArray(obj)) {
    return obj.map(omitEmptyProperties).filter((item) => !isEmpty(item))
  }

  const res: any = {}
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (typeof value === 'object') {
      const newValue = omitEmptyProperties(value)
      if (!isEmpty(newValue)) {
        res[key] = newValue
      }
    } else if (value !== null && trim(value) !== '') {
      res[key] = trim(value)
    }
  })

  return res
}

const service = createService()
export const request = createRequest(service)
