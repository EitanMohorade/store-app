import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Search, ImageOff } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useCompanies } from '@/hooks/useCompanies'
import { formatCurrency, stockBadge } from '@/lib/utils'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const schema = z.object({
  articulo:       z.string().min(1, 'Requerido'),
  descripcion:    z.string().min(1, 'Requerido'),
  stock:          z.coerce.number().min(0),
  precio:         z.coerce.number().min(0),
  precioUnitario: z.coerce.number().min(0),
  imagenUrl:      z.string().url('URL inválida').or(z.literal('')).optional(),
  categoriaId:    z.coerce.number().optional(),
  companiaId:     z.coerce.number().optional(),
})

/* ── Precio field con prefijo $ ───────────────────── */
function PriceInput({ label, registration, error }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none select-none">
          $
        </span>
        <input
          {...registration}
          type="number"
          min="0"
          step="1"
          className="form-input pl-7 font-semibold tabular-nums"
          placeholder="0"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  )
}

function ProductForm({ product, onClose }) {
  const { data: cats  = [] } = useCategories()
  const { data: comps = [] } = useCompanies()
  const create = useCreateProduct()
  const update = useUpdateProduct()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      articulo:       product?.articulo ?? '',
      descripcion:    product?.descripcion ?? '',
      stock:          product?.stock ?? 0,
      precio:         product?.precio ?? 0,
      precioUnitario: product?.precioUnitario ?? 0,
      imagenUrl:      product?.imagenUrl ?? '',
      categoriaId:    product?.categoria?.id ?? '',
      companiaId:     product?.compania?.id ?? '',
    },
  })

  const imgUrl  = watch('imagenUrl')
  const precio  = watch('precio')
  const pUnit   = watch('precioUnitario')

  async function onSubmit(values) {
    const payload = {
      articulo:       values.articulo,
      descripcion:    values.descripcion,
      stock:          values.stock,
      precio:         values.precio,
      precioUnitario: values.precioUnitario,
      imagenUrl:      values.imagenUrl || null,
      categoria:      values.categoriaId ? { id: Number(values.categoriaId) } : null,
      compania:       values.companiaId  ? { id: Number(values.companiaId)  } : null,
    }
    if (product) await update.mutateAsync({ id: product.id, data: payload })
    else          await create.mutateAsync(payload)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Identificación */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Artículo / Código</label>
          <input {...register('articulo')} className="form-input" placeholder="AR-1001" />
          {errors.articulo && <p className="text-xs text-red-500 mt-1">{errors.articulo.message}</p>}
        </div>
        <div>
          <label className="form-label">Descripción</label>
          <input {...register('descripcion')} className="form-input" placeholder="Leche entera 1L" />
          {errors.descripcion && <p className="text-xs text-red-500 mt-1">{errors.descripcion.message}</p>}
        </div>
      </div>

      {/* Precios — bloque destacado */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
          Precios (ARS)
        </p>
        <div className="grid grid-cols-2 gap-4">
          <PriceInput
            label="Precio de venta"
            registration={register('precio')}
            error={errors.precio}
          />
          <PriceInput
            label="Precio unitario (lista)"
            registration={register('precioUnitario')}
            error={errors.precioUnitario}
          />
        </div>

        {/* Preview de precios en tiempo real */}
        {(Number(precio) > 0 || Number(pUnit) > 0) && (
          <div className="flex gap-6 pt-1">
            <div>
              <p className="text-[10px] text-brand-500 uppercase tracking-wider font-bold mb-0.5">Venta</p>
              <p className="font-serif text-xl text-gray-900">{formatCurrency(precio)}</p>
            </div>
            {Number(pUnit) > 0 && Number(pUnit) !== Number(precio) && (
              <>
                <div className="w-px bg-brand-200" />
                <div>
                  <p className="text-[10px] text-brand-500 uppercase tracking-wider font-bold mb-0.5">Lista</p>
                  <p className="font-serif text-xl text-gray-500 line-through">{formatCurrency(pUnit)}</p>
                </div>
                <div className="w-px bg-brand-200" />
                <div>
                  <p className="text-[10px] text-green-600 uppercase tracking-wider font-bold mb-0.5">Descuento</p>
                  <p className="font-serif text-xl text-green-600">
                    {Number(pUnit) > 0
                      ? `-${Math.round((1 - Number(precio) / Number(pUnit)) * 100)}%`
                      : '—'}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Stock + categoría + compañía */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="form-label">Stock</label>
          <input {...register('stock')} type="number" min="0" className="form-input" />
          {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
        </div>
        <div>
          <label className="form-label">Categoría</label>
          <select {...register('categoriaId')} className="form-select">
            <option value="">— Sin categoría —</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Compañía</label>
          <select {...register('companiaId')} className="form-select">
            <option value="">— Sin compañía —</option>
            {comps.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Imagen */}
      <div>
        <label className="form-label">URL de imagen (opcional)</label>
        <input {...register('imagenUrl')} className="form-input" placeholder="https://..." />
        {errors.imagenUrl && <p className="text-xs text-red-500 mt-1">{errors.imagenUrl.message}</p>}
        {imgUrl && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mt-2">
            <img
              src={imgUrl}
              alt="preview"
              onError={(e) => { e.target.style.display = 'none' }}
              className="w-14 h-14 object-cover rounded-lg border border-gray-200"
            />
            <p className="text-xs text-gray-400 truncate flex-1">{imgUrl}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-[2] justify-center">
          {isSubmitting
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : product ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts()
  const deleteProduct = useDeleteProduct()

  const [search,     setSearch]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const filtered = products.filter((p) =>
    !search ||
    p.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
    p.articulo?.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() { setEditItem(null); setShowForm(true) }
  function openEdit(p)  { setEditItem(p);    setShowForm(true) }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} productos registrados</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-9"
          placeholder="Buscar por nombre o código..."
        />
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
                <th className="table-th">Imagen</th>
                <th className="table-th">Artículo</th>
                <th className="table-th">Descripción</th>
                <th className="table-th">Categoría</th>
                <th className="table-th">Compañía</th>
                <th className="table-th">Precio</th>
                <th className="table-th">Stock</th>
                <th className="table-th w-28"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-td text-center text-gray-400 py-10">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : filtered.map((p) => {
                const stock = stockBadge(p.stock)
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      {p.imagenUrl ? (
                        <img src={p.imagenUrl} alt={p.descripcion}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageOff className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </td>
                    <td className="table-td">
                      <span className="badge badge-brand text-[11px]">{p.articulo}</span>
                    </td>
                    <td className="table-td font-medium max-w-[200px] truncate">{p.descripcion}</td>
                    <td className="table-td text-gray-500 text-xs">{p.categoria?.nombre || '—'}</td>
                    <td className="table-td text-gray-500 text-xs">{p.compania?.nombre || '—'}</td>
                    <td className="table-td">
                      <span className="font-semibold text-brand-600">{formatCurrency(p.precio)}</span>
                    </td>
                    <td className="table-td">
                      <span className={`badge text-[11px] ${stock.cls}`}>{stock.label}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteItem(p)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editItem ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <ProductForm product={editItem} onClose={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        title="Eliminar producto"
        message={`¿Eliminás el producto "${deleteItem?.descripcion}"? Esta acción no se puede deshacer.`}
        loading={deleteProduct.isPending}
        onConfirm={() => deleteProduct.mutate(deleteItem.id, { onSuccess: () => setDeleteItem(null) })}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  )
}
