import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companiesApi } from '@/api/companies'
import { getErrorMessage } from '@/api/axios'
import toast from 'react-hot-toast'

export const COMPANIES_KEY = ['companies']

export function useCompanies() {
  return useQuery({
    queryKey: COMPANIES_KEY,
    queryFn: companiesApi.getAll,
    staleTime: 1000 * 60,
  })
}

export function useCreateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: companiesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: COMPANIES_KEY }); toast.success('Compañía creada.') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useUpdateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => companiesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: COMPANIES_KEY }); toast.success('Compañía actualizada.') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDeleteCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: companiesApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: COMPANIES_KEY }); toast.success('Compañía eliminada.') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
