import { X, ShoppingBag, Tag, Building2, Package } from 'lucide-react'
import { formatCurrency, stockBadge } from '@/lib/utils'

/**
 * Modal de detalle de producto con productos relacionados (misma categoría).
 * Props:
 *  - product: objeto producto | null
 *  - allProducts: lista completa de productos (para calcular relacionados)
 *  - onClose: () => void
 *  - onSelectProduct: (product) => void — al hacer click en un relacionado
 */
export default function ProductModal({ product, allProducts = [], onClose, onSelectProduct }) {
  if (!product) return null

  const stock = stockBadge(product.stock)
  const hasDiscount = product.precioUnitario && product.precioUnitario > product.precio
  const discountPct = hasDiscount
    ? Math.round((1 - product.precio / product.precioUnitario) * 100)
    : 0

  // Productos de la misma categoría, excluyendo el actual
  const related = allProducts.filter(
    (p) => p.id !== product.id && p.categoria?.id === product.categoria?.id
  ).slice(0, 4)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto
                   animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header con imagen ── */}
        <div className="relative">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 shadow
                       flex items-center justify-center text-gray-600 hover:text-gray-900
                       hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Imagen principal */}
          <div className="h-72 sm:h-80 bg-brand-50 rounded-t-2xl overflow-hidden">
            {product.imagenUrl ? (
              <img
                src={product.imagenUrl}
                alt={product.descripcion}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-brand-300 opacity-40" />
              </div>
            )}
          </div>

          {/* Badge descuento */}
          {hasDiscount && (
            <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold
                             px-2.5 py-1 rounded-full">
              -{discountPct}% OFF
            </span>
          )}
        </div>

        {/* ── Contenido ── */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">

            {/* Info principal */}
            <div className="flex-1 min-w-0">
              {/* Artículo + categoría */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="badge badge-brand text-[11px]">{product.articulo}</span>
                {product.categoria && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Tag className="w-3 h-3" /> {product.categoria.nombre}
                  </span>
                )}
                {product.compania && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Building2 className="w-3 h-3" /> {product.compania.nombre}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 leading-tight mb-1">
                {product.descripcion}
              </h2>

              {/* Stock */}
              <span className={`badge text-xs mt-1 inline-flex ${stock.cls}`}>
                <Package className="w-3 h-3 mr-1" /> {stock.label}
              </span>
            </div>

            {/* Precios */}
            <div className="sm:text-right flex-shrink-0">
              <p className="font-serif text-4xl text-brand-600 font-semibold leading-none">
                {formatCurrency(product.precio)}
              </p>
              {hasDiscount && (
                <p className="text-base text-gray-400 line-through mt-1">
                  {formatCurrency(product.precioUnitario)}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">Precio final</p>
            </div>
          </div>

          {/* ── Productos relacionados ── */}
          {related.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-serif text-lg text-gray-900 mb-4">
                Más de <span className="text-brand-600">{product.categoria?.nombre}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.map((rel) => {
                  const relStock = stockBadge(rel.stock)
                  return (
                    <button
                      key={rel.id}
                      onClick={() => onSelectProduct(rel)}
                      className="group text-left bg-gray-50 hover:bg-brand-50 rounded-xl overflow-hidden
                                 border border-gray-100 hover:border-brand-200 transition-all duration-200"
                    >
                      <div className="h-24 bg-white overflow-hidden">
                        {rel.imagenUrl ? (
                          <img
                            src={rel.imagenUrl}
                            alt={rel.descripcion}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                          {rel.articulo}
                        </p>
                        <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-snug mb-1.5">
                          {rel.descripcion}
                        </p>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-serif text-brand-600 font-semibold">
                            {formatCurrency(rel.precio)}
                          </p>
                          <span className={`badge text-[9px] ${relStock.cls}`}>
                            {rel.stock}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
