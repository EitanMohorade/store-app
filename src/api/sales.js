import { api } from './axios'

export const salesApi = {
  getAll:    ()            => api.get('/ventas').then(r => r.data),
  getById:   (id)          => api.get(`/ventas/${id}`).then(r => r.data),
  getToday:  ()            => api.get('/ventas/hoy').then(r => r.data),
  getWeek:   ()            => api.get('/ventas/semana').then(r => r.data),
  getMonth:  ()            => api.get('/ventas/mes').then(r => r.data),
  create:    (payload)     => api.post('/ventas', payload).then(r => r.data),
  update:    (id, payload) => api.put(`/ventas/${id}`, payload).then(r => r.data),
  remove:    (id)          => api.delete(`/ventas/${id}`).then(r => r.data),
}
