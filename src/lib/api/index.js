import { API_URL } from '../config'
import { mockApi } from './mockApi'
import { httpApi } from './httpApi'
import { productionApi } from './productionApi'

/** Single entry point for data access. Set VITE_API_URL to use the real backend. */
export const api = API_URL ? productionApi : mockApi
export const isMockApi = !API_URL
export { ApiError } from './errors'
export * from './steps'
