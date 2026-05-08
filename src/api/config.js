import { api } from './axios'

export const configApi = {
  /** GET /api/configuracion — público, no requiere auth */
  get: () => api.get('/configuracion').then(r => r.data),

  /** PUT /api/configuracion — requiere ADMIN */
  update: (payload) => api.put('/configuracion', payload).then(r => r.data),
}
