import { ShoppingBag } from 'lucide-react'
import { formatCurrency, stockBadge } from '@/lib/utils'

export default function ProductCard({ product }) {
  const stock = stockBadge(product.stock)

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm
                        hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative h-44 bg-brand-50 overflow-hidden">
        {product.imagenUrl ? (
          <img
            src={product.imagenUrl}
            alt={product.descripcion}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-brand-300 opacity-50" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
          {product.categoria && (
            <span className="badge bg-gray-900/75 text-white text-[10px]">
              {product.categoria.nombre}
            </span>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span className={`badge text-[10px] ${stock.cls}`}>{stock.label}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
          {product.articulo}
        </p>
        <h3 className="font-medium text-gray-900 text-sm leading-snug mb-3 line-clamp-2">
          {product.descripcion}
        </h3>

        <div className="flex items-end justify-between">
          <div>
            <p className="font-serif text-xl text-brand-600 font-semibold leading-none">
              {formatCurrency(product.precio)}
            </p>
            {product.precioUnitario && product.precioUnitario !== product.precio && (
              <p className="text-xs text-gray-400 mt-0.5 line-through">
                {formatCurrency(product.precioUnitario)}
              </p>
            )}
          </div>
          {product.compania && (
            <span className="text-[11px] text-gray-400">{product.compania.nombre}</span>
          )}
        </div>
      </div>
    </article>
  )
}
