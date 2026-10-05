import { httpApi } from './httpApi'
import { mockApi } from './mockApi'

// Repository analysis is read-only and already runs safely in the browser.
// All persistence and builds go through authenticated production endpoints.
export const productionApi = {
  ...httpApi,
  analyzeRepository: mockApi.analyzeRepository,
  restoreSamples: async () => [],
}