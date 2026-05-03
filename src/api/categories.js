import { api } from './axios'

export const categoriesApi = {
  getAll:  ()            => api.get('/categorias').then(r => r.data),
  getById: (id)          => api.get(`/categorias/${id}`).then(r => r.data),
  create:  (payload)     => api.post('/categorias', payload).then(r => r.data),
  update:  (id, payload) => api.put(`/categorias/${id}`, payload).then(r => r.data),
  remove:  (id)          => api.delete(`/categorias/${id}`).then(r => r.data),
}
