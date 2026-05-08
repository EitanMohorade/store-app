import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { setCredentials } from '@/api/axios'
import { adminsApi } from '@/api/admins'
import { getErrorMessage } from '@/api/axios'
import Modal from './Modal'

const schema = z.object({
  nombre:   z.string().min(1, 'Requerido'),
  password: z.string().min(1, 'Requerido'),
})

/**
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - redirectTo: string (default '/admin') — ruta a la que redirige tras login exitoso
 */
export default function LoginModal({ open, onClose, redirectTo = '/admin' }) {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values) {
    setServerError('')
    setCredentials(values)
    try {
      await adminsApi.verify()
      login(values)
      reset()
      onClose()
      navigate(redirectTo)           // ← redirige al panel tras login exitoso
    } catch (e) {
      setCredentials(null)
      setServerError(
        e?.response?.status === 401 || e?.response?.status === 403
          ? 'Credenciales incorrectas o sin permisos de administrador.'
          : getErrorMessage(e)
      )
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Acceso Administrador" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="form-label">Usuario</label>
          <input {...register('nombre')} className="form-input" placeholder="admin" autoFocus />
          {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className="form-label">Contraseña</label>
          <input
            {...register('password')} type="password"
            className="form-input" placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {serverError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <button type="submit" disabled={isSubmitting}
          className="btn-primary w-full justify-center py-2.5">
          {isSubmitting
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><LogIn className="w-4 h-4" /> Ingresar al panel</>}
        </button>
      </form>
    </Modal>
  )
}
