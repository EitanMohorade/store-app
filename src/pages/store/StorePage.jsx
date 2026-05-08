import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, LayoutDashboard, MapPin, LogIn } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/context/AuthContext'
import { useConfig } from '@/hooks/useConfig'
import LoginModal from '@/components/shared/LoginModal'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'

export default function StorePage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: products   = [], isLoading } = useProducts()
  const { data: categories = [] }            = useCategories()
  const { data: config     = {} }            = useConfig()

  const [search,          setSearch]          = useState('')
  const [catFilter,       setCatFilter]       = useState(null)
  const [showLogin,       setShowLogin]       = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const filtered = products.filter((p) => {
    const matchCat  = !catFilter || p.categoria?.id === catFilter
    const matchText = !search ||
      p.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
      p.articulo?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchText
  })

  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      {/* ── Navbar ── */}
      <header className="bg-gray-900 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-xl text-white">
              {config.nombre || 'Mi Tienda'}
            </span>
            {config.direccion && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400 ml-2">
                <MapPin className="w-3 h-3" /> {config.direccion}
              </span>
            )}
          </div>

          {isAdmin ? (
            <button onClick={() => navigate('/admin')} className="btn-primary text-xs">
              <LayoutDashboard className="w-4 h-4" /> Panel Admin
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <LogIn className="w-4 h-4" /> Admin
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          {config.direccion && (
            <p className="text-brand-400 text-xs uppercase tracking-widest font-semibold mb-3">
              {config.direccion}
            </p>
          )}
          <h1 className="font-serif text-4xl sm:text-5xl text-white leading-tight mb-4">
            {config.tagline || 'Bienvenidos a nuestra tienda'}
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-xl mx-auto">
            {config.descripcion || 'Explorá nuestra selección de productos de primera calidad.'}
          </p>
        </div>
      </section>

      {/* ── Filtros ── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="form-input pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ id: null, nombre: 'Todos' }, ...categories].map((cat) => (
              <button
                key={cat.id ?? 'all'}
                onClick={() => setCatFilter(cat.id)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all
                  ${catFilter === cat.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grilla ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No se encontraron productos.</p>
            <p className="text-gray-400 text-sm mt-1">Probá con otro filtro o búsqueda.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-5">
              {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={setSelectedProduct}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-500 text-xs text-center py-6 mt-10">
        {config.nombre || 'Mi Tienda'}{config.direccion ? ` · ${config.direccion}` : ''}
      </footer>

      {/* ── Modales ── */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />

      <ProductModal
        product={selectedProduct}
        allProducts={products}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={setSelectedProduct}  // navegar entre relacionados
      />
    </div>
  )
}
