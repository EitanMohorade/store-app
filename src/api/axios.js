import axios from 'axios'
import { basicAuth } from '@/lib/utils'

/** Base Axios instance — proxy in vite.config.js handles /api → localhost:8080 */
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

/**
 * Attach credentials before every request.
 * credentials = { nombre, password } | null
 */
export function setCredentials(credentials) {
  api.interceptors.request.use((config) => {
    if (credentials) {
      config.headers['Authorization'] = basicAuth(credentials.nombre, credentials.password)
    } else {
      delete config.headers['Authorization']
    }
    return config
  })
}

/** Normalize API errors to a readable message */
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Error inesperado'
  )
}
