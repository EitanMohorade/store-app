import { api } from './axios'

export const productsApi = {
  getAll:  ()        => api.get('/productos').then(r => r.data),
  getById: (id)      => api.get(`/productos/${id}`).then(r => r.data),
  create:  (payload) => api.post('/productos', payload).then(r => r.data),
  update:  (id, payload) => api.put(`/productos/${id}`, payload).then(r => r.data),
  remove:  (id)      => api.delete(`/productos/${id}`).then(r => r.data),
}
