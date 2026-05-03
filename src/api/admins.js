import { api } from './axios'

export const adminsApi = {
  create: (payload)     => api.post('/admins', payload).then(r => r.data),
  update: (id, payload) => api.put(`/admins/${id}`, payload).then(r => r.data),
  remove: (id)          => api.delete(`/admins/${id}`).then(r => r.data),
  /** Used only for credential validation — checks access to a protected endpoint */
  verify: ()            => api.get('/ventas').then(r => r.data),
}
