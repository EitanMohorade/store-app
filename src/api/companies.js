import { api } from './axios'

export const companiesApi = {
  getAll:  ()            => api.get('/companias').then(r => r.data),
  getById: (id)          => api.get(`/companias/${id}`).then(r => r.data),
  create:  (payload)     => api.post('/companias', payload).then(r => r.data),
  update:  (id, payload) => api.put(`/companias/${id}`, payload).then(r => r.data),
  remove:  (id)          => api.delete(`/companias/${id}`).then(r => r.data),
}
