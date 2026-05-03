import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const schema = z.object({
  nombre:     z.string().min(1, 'Requerido'),
  descripcion: z.string().optional(),
})

function CategoryForm({ category, onClose }) {
  const create = useCreateCategory()
  const update = useUpdateCategory()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre:      category?.nombre      ?? '',
      descripcion: category?.descripcion ?? '',
    },
  })

  async function onSubmit(values) {
    if (category) await update.mutateAsync({ id: category.id, data: values })
    else          await create.mutateAsync(values)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Nombre</label>
        <input {...register('nombre')} className="form-input" placeholder="Lácteos" autoFocus />
        {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
      </div>
      <div>
        <label className="form-label">Descripción (opcional)</label>
        <input {...register('descripcion')} className="form-input" placeholder="Productos lácteos y derivados" />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-[2] justify-center">
          {isSubmitting
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : category ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </form>
  )
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()

  const [showForm,   setShowForm]   = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const COLORS = ['bg-brand-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500']

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Categorías</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categorías registradas</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="page-card flex flex-col items-center justify-center py-20">
          <Tag className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500">No hay categorías. Creá la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div key={cat.id} className="page-card p-5 flex flex-col gap-4 border-l-4"
              style={{ borderLeftColor: `var(--tw-color)` }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{cat.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{cat.descripcion || 'Sin descripción'}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => { setEditItem(cat); setShowForm(true) }}
                  className="btn-ghost flex-1 justify-center text-xs py-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => setDeleteItem(cat)}
                  className="btn-danger flex-1 justify-center text-xs py-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editItem ? 'Editar Categoría' : 'Nueva Categoría'}
        size="sm"
      >
        <CategoryForm category={editItem} onClose={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        title="Eliminar categoría"
        message={`¿Eliminás la categoría "${deleteItem?.nombre}"? Los productos asociados quedarán sin categoría.`}
        loading={deleteCategory.isPending}
        onConfirm={() => deleteCategory.mutate(deleteItem.id, { onSuccess: () => setDeleteItem(null) })}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  )
}
