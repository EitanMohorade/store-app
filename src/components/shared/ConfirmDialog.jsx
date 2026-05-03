import { AlertTriangle, X } from 'lucide-react'

/**
 * A simple modal confirm dialog.
 * Props: open, title, message, onConfirm, onCancel, loading
 */
export default function ConfirmDialog({ open, title = 'Confirmar', message, onConfirm, onCancel, loading }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onCancel} className="btn-secondary flex-1 justify-center" disabled={loading}>
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2
                         text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-all">
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
