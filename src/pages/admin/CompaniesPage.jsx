import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
})

function CompanyForm({ company, onClose }) {
  const create = useCreateCompany()
  const update = useUpdateCompany()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: company?.nombre ?? '' },
  })

  async function onSubmit(values) {
    if (company) await update.mutateAsync({ id: company.id, data: values })
    else          await create.mutateAsync(values)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Nombre de la compañía</label>
        <input {...register('nombre')} className="form-input" placeholder="Acme Foods SA" autoFocus />
        {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-[2] justify-center">
          {isSubmitting
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : company ? 'Guardar' : 'Crear compañía'}
        </button>
      </div>
    </form>
  )
}

export default function CompaniesPage() {
  const { data: companies = [], isLoading } = useCompanies()
  const deleteCompany = useDeleteCompany()

  const [showForm,   setShowForm]   = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Compañías</h1>
          <p className="text-gray-500 text-sm mt-1">{companies.length} compañías registradas</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva compañía
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({length:4}).map((_,i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="page-card flex flex-col items-center justify-center py-20">
          <Building2 className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500">No hay compañías. Creá la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {companies.map((c) => (
            <div key={c.id} className="page-card p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{c.nombre}</h3>
                  <p className="text-xs text-gray-400">ID: {c.id}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => { setEditItem(c); setShowForm(true) }}
                  className="btn-ghost flex-1 justify-center text-xs py-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => setDeleteItem(c)}
                  className="btn-danger flex-1 justify-center text-xs py-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editItem ? 'Editar Compañía' : 'Nueva Compañía'} size="sm">
        <CompanyForm company={editItem} onClose={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        title="Eliminar compañía"
        message={`¿Eliminás la compañía "${deleteItem?.nombre}"?`}
        loading={deleteCompany.isPending}
        onConfirm={() => deleteCompany.mutate(deleteItem.id, { onSuccess: () => setDeleteItem(null) })}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  )
}
