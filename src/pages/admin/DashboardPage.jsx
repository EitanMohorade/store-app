import { useSales, useSalesToday, useSalesWeek, useSalesMonth } from '@/hooks/useSales'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, ShoppingCart, DollarSign, Calendar } from 'lucide-react'

function StatCard({ label, count, amount, icon: Icon, color }) {
  return (
    <div className="stat-card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="font-serif text-3xl text-gray-900 mt-0.5 leading-none">{count}</p>
        <p className="text-sm font-semibold text-gray-500 mt-1">{formatCurrency(amount)}</p>
      </div>
    </div>
  )
}

function buildChartData(sales) {
  if (!sales?.length) return []
  const map = {}
  sales.forEach((s) => {
    const d = s.fecha ? new Date(s.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : '?'
    if (!map[d]) map[d] = { date: d, total: 0, ventas: 0 }
    map[d].total += s.totalPrecio || 0
    map[d].ventas += 1
  })
  return Object.values(map).slice(-14)
}

export default function DashboardPage() {
  const { data: all    = [], isLoading } = useSales()
  const { data: today  = [] }            = useSalesToday()
  const { data: week   = [] }            = useSalesWeek()
  const { data: month  = [] }            = useSalesMonth()

  const sum = (arr) => arr.reduce((a, v) => a + (v.totalPrecio || 0), 0)
  const chartData = buildChartData(month)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({length:4}).map((_,i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general de ventas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Hoy"           count={today.length}  amount={sum(today)}  icon={ShoppingCart}  color="bg-brand-500" />
        <StatCard label="Esta semana"   count={week.length}   amount={sum(week)}   icon={TrendingUp}    color="bg-green-600" />
        <StatCard label="Este mes"      count={month.length}  amount={sum(month)}  icon={Calendar}      color="bg-blue-600" />
        <StatCard label="Total"         count={all.length}    amount={sum(all)}    icon={DollarSign}    color="bg-amber-600" />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="page-card p-6">
          <h2 className="font-serif text-xl text-gray-900 mb-6">Ventas del mes (por día)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(val) => [formatCurrency(val), 'Total']}
                contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13 }}
              />
              <Bar dataKey="total" fill="#e22d0e" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent sales table */}
      <div className="page-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-xl text-gray-900">Últimas ventas</h2>
        </div>
        {all.length === 0 ? (
          <p className="text-gray-400 text-sm p-6">No hay ventas registradas todavía.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">ID</th>
                <th className="table-th">Producto</th>
                <th className="table-th">Cant.</th>
                <th className="table-th">Total</th>
                <th className="table-th">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {[...all].reverse().slice(0, 8).map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td text-gray-400">#{v.id}</td>
                  <td className="table-td font-medium">{v.producto?.descripcion || '—'}</td>
                  <td className="table-td">{v.cantidad}</td>
                  <td className="table-td font-semibold text-brand-600">{formatCurrency(v.totalPrecio)}</td>
                  <td className="table-td text-gray-400 text-xs">{formatDate(v.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
