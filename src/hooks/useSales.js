import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesApi } from '@/api/sales'
import { getErrorMessage } from '@/api/axios'
import toast from 'react-hot-toast'

export const SALES_KEY    = ['sales']
export const SALES_TODAY  = ['sales', 'today']
export const SALES_WEEK   = ['sales', 'week']
export const SALES_MONTH  = ['sales', 'month']

const ALL_SALES_KEYS = [SALES_KEY, SALES_TODAY, SALES_WEEK, SALES_MONTH]

export function useSales()      { return useQuery({ queryKey: SALES_KEY,   queryFn: salesApi.getAll,   staleTime: 5_000 }) }
export function useSalesToday() { return useQuery({ queryKey: SALES_TODAY, queryFn: salesApi.getToday, staleTime: 5_000 }) }
export function useSalesWeek()  { return useQuery({ queryKey: SALES_WEEK,  queryFn: salesApi.getWeek,  staleTime: 5_000 }) }
export function useSalesMonth() { return useQuery({ queryKey: SALES_MONTH, queryFn: salesApi.getMonth, staleTime: 5_000 }) }

export function useCreateSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      ALL_SALES_KEYS.forEach(k => qc.invalidateQueries({ queryKey: k }))
      // also invalidate products (stock changes)
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Venta registrada.')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDeleteSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salesApi.remove,
    onSuccess: () => {
      ALL_SALES_KEYS.forEach(k => qc.invalidateQueries({ queryKey: k }))
      toast.success('Venta eliminada.')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
