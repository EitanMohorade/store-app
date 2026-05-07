import { api } from './axios'

/**
 * Construye el FormData que espera el backend:
 *   - parte "datos": JSON con application/json
 *   - parte "imagen": archivo (opcional)
 */
function buildFormData(payload, imageFile) {
  const formData = new FormData()

  const datos = {
    articulo:       payload.articulo,
    descripcion:    payload.descripcion,
    stock:          payload.stock,
    precio:         payload.precio,
    precioUnitario: payload.precioUnitario,
    categoria:      payload.categoria  ?? null,
    compania:       payload.compania   ?? null,
  }

  formData.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }))

  if (imageFile) {
    formData.append('imagen', imageFile)
  }

  return formData
}

export const productsApi = {
  getAll:  () => api.get('/productos').then(r => r.data),
  getById: (id) => api.get(`/productos/${id}`).then(r => r.data),

  /** POST multipart/form-data — NO establecer Content-Type manualmente */
  create: ({ payload, imageFile }) =>
    api.post('/productos', buildFormData(payload, imageFile), {
      headers: { 'Content-Type': undefined }, // axios pone el boundary automático
    }).then(r => r.data),

  /** PUT multipart/form-data — si no hay imageFile, el backend conserva la imagen existente */
  update: ({ id, payload, imageFile }) =>
    api.put(`/productos/${id}`, buildFormData(payload, imageFile), {
      headers: { 'Content-Type': undefined },
    }).then(r => r.data),

  remove: (id) => api.delete(`/productos/${id}`).then(r => r.data),
}
