import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  useSales, useSalesToday, useSalesWeek, useSalesMonth,
  useCreateSale, useDeleteSale,
} from '@/hooks/useSales'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useCompanies } from '@/hooks/useCompanies'
import { formatCurrency, formatDate } from '@/lib/utils'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import toast from 'react-hot-toast'

/* ─────────────────────────────────────────────────────────
   FORM
───────────────────────────────────────────────────────── */
function SaleForm({ onClose }) {
  const { data: products   = [] } = useProducts()
  const { data: categories = [] } = useCategories()
  const { data: companies  = [] } = useCompanies()
  const create = useCreateSale()

  // Filtros locales (solo afectan la lista del select)
  const [catFilter,  setCatFilter]  = useState('')
  const [compFilter, setCompFilter] = useState('')

  // Campos del formulario manejados con state simple para
  // evitar cualquier coerción inesperada de react-hook-form
  const [productoId, setProductoId] = useState('')
  const [cantidad,   setCantidad]   = useState(1)
  const [fecha,      setFecha]      = useState(
    new Date().toISOString().slice(0, 16)
  )

  // Producto seleccionado — comparación numérica explícita
  const selected = productoId
    ? products.find((p) => p.id === Number(productoId))
    : null

  const total = selected ? selected.precio * cantidad : 0

  // Productos filtrados por categoría y/o compañía
  const filteredProducts = products.filter((p) => {
    const byCat  = !catFilter  || p.categoria?.id === Number(catFilter)
    const byComp = !compFilter || p.compania?.id  === Number(compFilter)
    return byCat && byComp
  })

  async function handleSubmit(e) {
    e.preventDefault()

    if (!productoId) {
      toast.error('Seleccioná un producto.')
      return
    }
    if (!selected) {
      toast.error('Producto no encontrado.')
      return
    }
    if (cantidad < 1) {
      toast.error('La cantidad debe ser al menos 1.')
      return
    }
    if (cantidad > selected.stock) {
      toast.error(`Stock insuficiente. Disponible: ${selected.stock}`)
      return
    }

    // Payload exacto según la API
    const payload = {
      producto: { id: selected.id },
      cantidad: Number(cantidad),
      fecha:    fecha + ':00',
    }

    await create.mutateAsync(payload)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Filtros ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Filtrar por categoría</label>
          <select
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); setProductoId('') }}
            className="form-select"
          >
            <option value="">— Todas —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Filtrar por compañía</label>
          <select
            value={compFilter}
            onChange={(e) => { setCompFilter(e.target.value); setProductoId('') }}
            className="form-select"
          >
            <option value="">— Todas —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Selector de producto ── */}
      <div>
        <label className="form-label">
          Producto
          <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal">
            ({filteredProducts.length} disponibles)
          </span>
        </label>
        <select
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
          className="form-select"
          required
        >
          <option value="">— Seleccioná un producto —</option>
          {filteredProducts.map((p) => (
            <option key={p.id} value={p.id} disabled={p.stock === 0}>
              {p.articulo} · {p.descripcion} — stock: {p.stock}
              {p.stock === 0 ? ' (sin stock)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* ── Info producto seleccionado ── */}
      {selected && (
        <div className="grid grid-cols-3 gap-3 bg-brand-50 rounded-xl p-4">
          <div>
            <p className="text-[10px] text-brand-500 uppercase tracking-wider font-bold mb-0.5">Artículo</p>
            <p className="font-semibold text-gray-900 text-sm">{selected.articulo}</p>
            <p className="text-xs text-gray-500 mt-0.5">{selected.categoria?.nombre || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-brand-500 uppercase tracking-wider font-bold mb-0.5">Precio unitario</p>
            <p className="font-serif text-xl text-gray-900">{formatCurrency(selected.precio)}</p>
          </div>
          <div>
            <p className="text-[10px] text-brand-500 uppercase tracking-wider font-bold mb-0.5">Stock disponible</p>
            <p className={`font-serif text-xl font-semibold
              ${selected.stock === 0 ? 'text-red-600' : selected.stock < 5 ? 'text-amber-600' : 'text-gray-900'}`}>
              {selected.stock}
            </p>
          </div>
        </div>
      )}

      {/* ── Sin stock ── */}
      {selected?.stock === 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Este producto no tiene stock disponible.
        </div>
      )}

      {/* ── Cantidad + fecha ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Cantidad</label>
          <input
            type="number"
            value={cantidad}
            min={1}
            max={selected?.stock || undefined}
            onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
            className="form-input"
            required
          />
          {selected && cantidad > selected.stock && (
            <p className="text-xs text-red-500 mt-1">
              Superás el stock disponible ({selected.stock}).
            </p>
          )}
        </div>
        <div>
          <label className="form-label">Fecha y hora</label>
          <input
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="form-input"
            required
          />
        </div>
      </div>

      {/* ── Total en tiempo real ── */}
      {selected && cantidad > 0 && (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-sm text-gray-500">
            {cantidad} × {formatCurrency(selected.precio)}
          </span>
          <span className="font-serif text-2xl text-brand-600">{formatCurrency(total)}</span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={create.isPending || !productoId || !selected || selected.stock === 0 || cantidad > (selected?.stock ?? 0)}
          className="btn-primary flex-[2] justify-center"
        >
          {create.isPending
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : 'Registrar venta'}
        </button>
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */
const FILTERS = [
  { key: 'all',   label: 'Todas',       hook: useSales },
  { key: 'today', label: 'Hoy',         hook: useSalesToday },
  { key: 'week',  label: 'Esta semana', hook: useSalesWeek },
  { key: 'month', label: 'Este mes',    hook: useSalesMonth },
]

export default function SalesPage() {
  const [filter,     setFilter]     = useState('all')
  const [showForm,   setShowForm]   = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const deleteSale = useDeleteSale()

  const activeFilter = FILTERS.find((f) => f.key === filter)
  const { data: sales = [], isLoading } = activeFilter.hook()

  const totalMonto = sales.reduce((a, v) => a + (v.totalPrecio || 0), 0)
  const totalUnits = sales.reduce((a, v) => a + (v.cantidad   || 0), 0)

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

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all
              ${filter === key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="page-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">ID</th>
                <th className="table-th">Artículo</th>
                <th className="table-th">Descripción</th>
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
                  <td colSpan={8} className="table-td text-center text-gray-400 py-10">
                    No hay ventas en este período.
                  </td>
                </tr>
              ) : [...sales].reverse().map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td text-gray-400 text-xs">#{v.id}</td>
                  <td className="table-td">
                    <span className="badge badge-brand text-[11px]">
                      {v.producto?.articulo || '—'}
                    </span>
                  </td>
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
        message={`¿Eliminás la venta #${deleteItem?.id} de "${deleteItem?.producto?.articulo}"?`}
        loading={deleteSale.isPending}
        onConfirm={() => deleteSale.mutate(deleteItem.id, { onSuccess: () => setDeleteItem(null) })}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  )
}
