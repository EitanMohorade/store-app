import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '@/api/categories'
import { getErrorMessage } from '@/api/axios'
import toast from 'react-hot-toast'

export const CATEGORIES_KEY = ['categories']

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: categoriesApi.getAll,
    staleTime: 1000 * 60,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: CATEGORIES_KEY }); toast.success('Categoría creada.') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => categoriesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: CATEGORIES_KEY }); toast.success('Categoría actualizada.') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: CATEGORIES_KEY }); toast.success('Categoría eliminada.') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
