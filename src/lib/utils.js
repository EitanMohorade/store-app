import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Format number as ARS currency */
export function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

/** Format date string to local readable */
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Build base64 Authorization header */
export function basicAuth(nombre, password) {
  return `Basic ${btoa(`${nombre}:${password}`)}`
}

/** Store settings in localStorage */
export const storeSettings = {
  get: () => JSON.parse(localStorage.getItem('store_settings') ?? '{}'),
  set: (data) => localStorage.setItem('store_settings', JSON.stringify(data)),
}

/** Stock badge helper */
export function stockBadge(stock) {
  if (stock === 0) return { label: 'Sin stock', cls: 'badge-red' }
  if (stock < 5)  return { label: `${stock} — Bajo`, cls: 'badge-red' }
  if (stock < 15) return { label: `${stock} — Poco`, cls: 'badge-yellow' }
  return { label: stock.toString(), cls: 'badge-green' }
}
