import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, UserPlus, Store, Building2 } from 'lucide-react'
import { storeSettings } from '@/lib/utils'
import { adminsApi } from '@/api/admins'
import { getErrorMessage } from '@/api/axios'
import toast from 'react-hot-toast'
import { useCompanies } from '@/hooks/useCompanies'

/* ── Store Settings form ─────────────────────────── */
const storeSchema = z.object({
  nombre:      z.string().min(1, 'Requerido'),
  direccion:   z.string().optional(),
  tagline:     z.string().optional(),
  descripcion: z.string().optional(),
})

function StoreSettingsCard() {
  const saved = storeSettings.get()

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      nombre:      saved.nombre      || '',
      direccion:   saved.direccion   || '',
      tagline:     saved.tagline     || '',
      descripcion: saved.descripcion || '',
    },
  })

  function onSubmit(values) {
    storeSettings.set(values)
    toast.success('Configuración guardada.')
  }

  return (
    <div className="page-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
          <Store className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Información de la tienda</h2>
          <p className="text-xs text-gray-500 mt-0.5">Se muestra en la tienda pública</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nombre de la tienda</label>
            <input {...register('nombre')} className="form-input" placeholder="Mi Tienda" />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="form-label">Dirección del local</label>
            <input {...register('direccion')} className="form-input" placeholder="Av. Corrientes 1234, CABA" />
          </div>
        </div>
        <div>
          <label className="form-label">Eslogan / Tagline</label>
          <input {...register('tagline')} className="form-input" placeholder="Productos frescos, precios justos" />
        </div>
        <div>
          <label className="form-label">Descripción general</label>
          <textarea {...register('descripcion')} rows={3} className="form-input resize-none"
            placeholder="Describí tu tienda en pocas palabras..." />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            <Save className="w-4 h-4" /> Guardar cambios
          </button>
          <p className="text-xs text-gray-400">
            Guardado localmente en el navegador.
          </p>
        </div>
      </form>
    </div>
  )
}

/* ── Admin creation form ────────────────────────── */
const adminSchema = z.object({
  nombre:   z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

function NewAdminCard() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(adminSchema),
  })

  async function onSubmit(values) {
    try {
      await adminsApi.create(values)
      toast.success(`Administrador "${values.nombre}" creado.`)
      reset()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div className="page-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Nuevo administrador</h2>
          <p className="text-xs text-gray-500 mt-0.5">Crear una cuenta de admin adicional</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nombre de usuario</label>
            <input {...register('nombre')} className="form-input" placeholder="admin2" />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="form-label">Contraseña</label>
            <input {...register('password')} type="password" className="form-input" placeholder="••••••••" />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><UserPlus className="w-4 h-4" /> Crear administrador</>}
        </button>
      </form>
    </div>
  )
}

/* ── Companies preview ───────────────────────────── */
function CompaniesPreviewCard() {
  const { data: companies = [] } = useCompanies()

  return (
    <div className="page-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Building2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Compañías registradas</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Para modificarlas usá la sección <strong>Compañías</strong>
          </p>
        </div>
      </div>
      {companies.length === 0 ? (
        <p className="text-sm text-gray-400">No hay compañías todavía.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {companies.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-2.5">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-800">{c.nombre}</span>
              <span className="text-xs text-gray-400 ml-auto">ID {c.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────── */
export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm mt-1">Personalizá tu tienda y gestioná accesos</p>
      </div>

      <StoreSettingsCard />
      <CompaniesPreviewCard />
      <NewAdminCard />
    </div>
  )
}
