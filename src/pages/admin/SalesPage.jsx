import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { useSales, useSalesToday, useSalesWeek, useSalesMonth, useCreateSale, useDeleteSale } from '@/hooks/useSales'
import { useProducts } from '@/hooks/useProducts'
import { formatCurrency, formatDate } from '@/lib/utils'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const schema = z.object({
  productoId: z.coerce.number({ required_error: 'Seleccioná un producto' }).min(1, 'Seleccioná un producto'),
  cantidad:   z.coerce.number().min(1, 'Mínimo 1'),
  fecha:      z.string().min(1, 'Requerido'),
})

function SaleForm({ onClose }) {
  const { data: products = [] } = useProducts()
  const create = useCreateSale()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      productoId: '',
      cantidad:   1,
      fecha:      new Date().toISOString().slice(0, 16),
    },
  })

  const productoId = watch('productoId')
  const cantidad   = watch('cantidad')
  const selected   = products.find((p) => p.id === Number(productoId))
  const total      = (selected?.precio || 0) * (Number(cantidad) || 0)

  async function onSubmit(values) {
    await create.mutateAsync({
      producto: { id: Number(values.productoId) },
      cantidad: Number(values.cantidad),
      fecha:    values.fecha + ':00',
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Producto</label>
        <select {...register('productoId')} className="form-select">
          <option value="">— Seleccioná un producto —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.descripcion} — stock: {p.stock}
            </option>
          ))}
        </select>
        {errors.productoId && <p className="text-xs text-red-500 mt-1">{errors.productoId.message}</p>}
      </div>

      {selected && (
        <div className="flex gap-4 bg-brand-50 rounded-xl p-4">
          <div>
            <p className="text-[10px] text-brand-500 uppercase tracking-wider font-bold mb-0.5">Precio</p>
            <p className="font-serif text-2xl text-gray-900">{formatCurrency(selected.precio)}</p>
          </div>
          <div className="w-px bg-brand-100" />
          <div>
            <p className="text-[10px] text-brand-500 uppercase tracking-wider font-bold mb-0.5">Stock disponible</p>
            <p className={`font-serif text-2xl ${selected.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>
              {selected.stock}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Cantidad</label>
          <input {...register('cantidad')} type="number" min="1"
            max={selected?.stock || 9999} className="form-input" />
          {errors.cantidad && <p className="text-xs text-red-500 mt-1">{errors.cantidad.message}</p>}
        </div>
        <div>
          <label className="form-label">Fecha y hora</label>
          <input {...register('fecha')} type="datetime-local" className="form-input" />
        </div>
      </div>

      {selected && Number(cantidad) > 0 && (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-sm text-gray-500">Total estimado</span>
          <span className="font-serif text-2xl text-brand-600">{formatCurrency(total)}</span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
        <button type="submit" disabled={isSubmitting || !productoId} className="btn-primary flex-[2] justify-center">
          {isSubmitting
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : 'Registrar venta'}
        </button>
      </div>
    </form>
  )
}

const FILTERS = [
  { key: 'all',    label: 'Todas',        hook: useSales },
  { key: 'today',  label: 'Hoy',          hook: useSalesToday },
  { key: 'week',   label: 'Esta semana',  hook: useSalesWeek },
  { key: 'month',  label: 'Este mes',     hook: useSalesMonth },
]

export default function SalesPage() {
  const [filter,     setFilter]     = useState('all')
  const [showForm,   setShowForm]   = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const deleteSale = useDeleteSale()

  const activeFilter = FILTERS.find((f) => f.key === filter)
  const { data: sales = [], isLoading } = activeFilter.hook()

  const totalMonto  = sales.reduce((a, v) => a + (v.totalPrecio || 0), 0)
  const totalUnits  = sales.reduce((a, v) => a + (v.cantidad   || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Ventas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {sales.length} venta{sales.length !== 1 ? 's' : ''} · {totalUnits} unidades · {formatCurrency(totalMonto)}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva venta
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all
              ${filter === key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({length:5}).map((_,i) => (
            <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="page-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">ID</th>
                <th className="table-th">Producto</th>
                <th className="table-th">Cant.</th>
                <th className="table-th">P. Unit.</th>
                <th className="table-th">Total</th>
                <th className="table-th">Fecha</th>
                <th className="table-th w-16"></th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-td text-center text-gray-400 py-10">
                    No hay ventas en este período.
                  </td>
                </tr>
              ) : [...sales].reverse().map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td text-gray-400 text-xs">#{v.id}</td>
                  <td className="table-td font-medium">{v.producto?.descripcion || '—'}</td>
                  <td className="table-td">{v.cantidad}</td>
                  <td className="table-td text-gray-500">{formatCurrency(v.precioUnitario)}</td>
                  <td className="table-td font-semibold text-brand-600">{formatCurrency(v.totalPrecio)}</td>
                  <td className="table-td text-gray-400 text-xs">{formatDate(v.fecha)}</td>
                  <td className="table-td">
                    <button onClick={() => setDeleteItem(v)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Registrar Venta" size="md">
        <SaleForm onClose={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        title="Eliminar venta"
        message={`¿Eliminás la venta #${deleteItem?.id} de "${deleteItem?.producto?.descripcion}"?`}
        loading={deleteSale.isPending}
        onConfirm={() => deleteSale.mutate(deleteItem.id, { onSuccess: () => setDeleteItem(null) })}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  )
}
