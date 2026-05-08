import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Search, ImageOff, UploadCloud, X } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useCompanies } from '@/hooks/useCompanies'
import { formatCurrency, stockBadge } from '@/lib/utils'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const schema = z.object({
  articulo:       z.string().min(1, 'Requerido'),
  descripcion:    z.string().min(1, 'Requerido'),
  stock:          z.coerce.number().min(0, 'Mínimo 0'),
  precio:         z.coerce.number().min(0, 'Mínimo 0'),
  precioUnitario: z.coerce.number().min(0, 'Mínimo 0'),
  categoriaId:    z.coerce.number().optional(),
  companiaId:     z.coerce.number().optional(),
})

/* ── Input de precio con prefijo $ ───────────────── */
function PriceInput({ label, hint, registration, error }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 mb-1">{hint}</p>}
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

/* ── Zona de carga de imagen ─────────────────────── */
function ImageUploadZone({ currentImageUrl, onFileChange }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)   // URL local (blob)
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState('')

  function processFile(file) {
    setFileError('')
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Formato no permitido. Usá JPG, PNG o WebP.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('El archivo supera los 5 MB.')
      return
    }

    setPreview(URL.createObjectURL(file))
    onFileChange(file)
  }

  function handleInputChange(e) {
    processFile(e.target.files?.[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files?.[0])
  }

  function clearImage() {
    setPreview(null)
    onFileChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  // La imagen a mostrar: primero el preview local, sino la URL de Cloudinary existente
  const displayImage = preview || currentImageUrl

  return (
    <div>
      <label className="form-label">Imagen del producto</label>
      <p className="text-[11px] text-gray-400 mb-2">
        JPG, PNG o WebP · máx. 5 MB · opcional.
        {!preview && currentImageUrl && ' Si no subís una nueva, se conserva la imagen actual.'}
      </p>

      {displayImage ? (
        /* ── Preview de imagen ── */
        <div className="relative inline-block">
          <img
            src={displayImage}
            alt="preview"
            className="w-full max-h-52 object-contain rounded-xl border border-gray-200 bg-gray-50"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-900/70 text-white
                       flex items-center justify-center hover:bg-gray-900 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {preview && (
            <span className="absolute bottom-2 left-2 text-[10px] bg-green-600 text-white
                             px-2 py-0.5 rounded-full font-semibold">
              Nueva imagen
            </span>
          )}
          {!preview && currentImageUrl && (
            <span className="absolute bottom-2 left-2 text-[10px] bg-gray-700 text-white
                             px-2 py-0.5 rounded-full font-semibold">
              Imagen actual
            </span>
          )}
        </div>
      ) : (
        /* ── Zona de drop ── */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed
                      rounded-xl p-8 cursor-pointer transition-all
                      ${dragOver
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/50'}`}
        >
          <UploadCloud className={`w-8 h-8 ${dragOver ? 'text-brand-500' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-600">
            {dragOver ? 'Soltá la imagen aquí' : 'Arrastrá o hacé clic para subir'}
          </p>
          <p className="text-xs text-gray-400">JPG, PNG, WebP · máx. 5 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {fileError && <p className="text-xs text-red-500 mt-1.5">{fileError}</p>}
    </div>
  )
}

/* ── Formulario de producto ─────────────────────── */
function ProductForm({ product, onClose }) {
  const { data: cats  = [] } = useCategories()
  const { data: comps = [] } = useCompanies()
  const create = useCreateProduct()
  const update = useUpdateProduct()

  const [imageFile, setImageFile] = useState(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      articulo:       product?.articulo       ?? '',
      descripcion:    product?.descripcion    ?? '',
      stock:          product?.stock          ?? 0,
      precio:         product?.precio         ?? 0,
      precioUnitario: product?.precioUnitario ?? 0,
      categoriaId:    product?.categoria?.id  ?? '',
      companiaId:     product?.compania?.id   ?? '',
    },
  })

  const precio = watch('precio')
  const pUnit  = watch('precioUnitario')

  async function onSubmit(values) {
    const payload = {
      articulo:       values.articulo,
      descripcion:    values.descripcion,
      stock:          Number(values.stock),
      precio:         Number(values.precio),
      precioUnitario: Number(values.precioUnitario),
      categoria:      values.categoriaId ? { id: Number(values.categoriaId) } : null,
      compania:       values.companiaId  ? { id: Number(values.companiaId)  } : null,
    }

    if (product) {
      await update.mutateAsync({ id: product.id, payload, imageFile })
    } else {
      await create.mutateAsync({ payload, imageFile })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Identificación */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Artículo / Código</label>
          <input {...register('articulo')} className="form-input" placeholder="AR-1001" autoFocus />
          {errors.articulo && <p className="text-xs text-red-500 mt-1">{errors.articulo.message}</p>}
        </div>
        <div>
          <label className="form-label">Descripción</label>
          <input {...register('descripcion')} className="form-input" placeholder="bolso de cuero re lindo" />
          {errors.descripcion && <p className="text-xs text-red-500 mt-1">{errors.descripcion.message}</p>}
        </div>
      </div>

      {/* Precios */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Precios (ARS)</p>
        <div className="grid grid-cols-2 gap-4">
          <PriceInput
            label="Precio de venta"
            hint="Lo que paga el cliente"
            registration={register('precio')}
            error={errors.precio}
          />
          <PriceInput
            label="Precio unitario (lista)"
            hint="Precio de lista / sin descuento"
            registration={register('precioUnitario')}
            error={errors.precioUnitario}
          />
        </div>

        {/* Preview de precios */}
        {(Number(precio) > 0 || Number(pUnit) > 0) && (
          <div className="flex gap-6 pt-1 flex-wrap">
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
                    -{Math.round((1 - Number(precio) / Number(pUnit)) * 100)}%
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
      <ImageUploadZone
        currentImageUrl={product?.imagenUrl ?? null}
        onFileChange={setImageFile}
      />

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

/* ── Página principal ────────────────────────────── */
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} productos registrados</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true) }} className="btn-primary">
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
                <th className="table-th">Precio venta</th>
                <th className="table-th">Precio lista</th>
                <th className="table-th">Stock</th>
                <th className="table-th w-28"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-td text-center text-gray-400 py-10">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : filtered.map((p) => {
                const stock = stockBadge(p.stock)
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      {p.imagenUrl ? (
                        <img
                          src={p.imagenUrl}
                          alt={p.descripcion}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageOff className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </td>
                    <td className="table-td">
                      <span className="badge badge-brand text-[11px]">{p.articulo}</span>
                    </td>
                    <td className="table-td font-medium max-w-[180px] truncate">{p.descripcion}</td>
                    <td className="table-td text-gray-500 text-xs">{p.categoria?.nombre || '—'}</td>
                    <td className="table-td text-gray-500 text-xs">{p.compania?.nombre || '—'}</td>
                    <td className="table-td">
                      <span className="font-semibold text-brand-600">{formatCurrency(p.precio)}</span>
                    </td>
                    <td className="table-td">
                      <span className="text-gray-400 line-through text-xs">{formatCurrency(p.precioUnitario)}</span>
                    </td>
                    <td className="table-td">
                      <span className={`badge text-[11px] ${stock.cls}`}>{stock.label}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditItem(p); setShowForm(true) }}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteItem(p)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
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
        message={`¿Eliminás "${deleteItem?.descripcion}"? También se eliminará su imagen de Cloudinary. Esta acción no se puede deshacer.`}
        loading={deleteProduct.isPending}
        onConfirm={() => deleteProduct.mutate(deleteItem.id, { onSuccess: () => setDeleteItem(null) })}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  )
}
