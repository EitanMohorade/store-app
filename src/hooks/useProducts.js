import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/api/products'
import { getErrorMessage } from '@/api/axios'
import toast from 'react-hot-toast'

export const PRODUCTS_KEY = ['products']

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: productsApi.getAll,
    staleTime: 1000 * 30,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    // mutationFn recibe { payload, imageFile }
    mutationFn: productsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY })
      toast.success('Producto creado.')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    // mutationFn recibe { id, payload, imageFile }
    mutationFn: productsApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY })
      toast.success('Producto actualizado.')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY })
      toast.success('Producto eliminado.')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
