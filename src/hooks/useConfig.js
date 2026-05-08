import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { configApi } from '@/api/config'
import { getErrorMessage } from '@/api/axios'
import toast from 'react-hot-toast'

export const CONFIG_KEY = ['config']

/** Lee la configuración de la tienda desde el backend (público) */
export function useConfig() {
  return useQuery({
    queryKey: CONFIG_KEY,
    queryFn: configApi.get,
    staleTime: 1000 * 60 * 5, // 5 min — cambia poco
  })
}

/** Actualiza la configuración (requiere ADMIN) */
export function useUpdateConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: configApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONFIG_KEY })
      toast.success('Configuración guardada.')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
