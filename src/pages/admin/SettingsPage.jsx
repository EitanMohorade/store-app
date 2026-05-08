import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, UserPlus, Store, Building2, Pencil, Trash2, ShieldAlert } from 'lucide-react'
import { useConfig, useUpdateConfig } from '@/hooks/useConfig'
import { adminsApi } from '@/api/admins'
import { getErrorMessage } from '@/api/axios'
import { useCompanies } from '@/hooks/useCompanies'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Modal from '@/components/shared/Modal'
import toast from 'react-hot-toast'

/* ─────────────────────────────────────────────
   STORE SETTINGS
───────────────────────────────────────────── */
const storeSchema = z.object({
  nombre:      z.string().min(1, 'El nombre es obligatorio'),
  direccion:   z.string().optional(),
  tagline:     z.string().optional(),
  descripcion: z.string().optional(),
})

function StoreSettingsCard() {
  const { data: config = {}, isLoading } = useConfig()
  const updateConfig = useUpdateConfig()

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: { nombre: '', direccion: '', tagline: '', descripcion: '' },
  })

  useEffect(() => {
    if (config.nombre !== undefined) {
      reset({
        nombre:      config.nombre      ?? '',
        direccion:   config.direccion   ?? '',
        tagline:     config.tagline     ?? '',
        descripcion: config.descripcion ?? '',
      })
    }
  }, [config, reset])

  if (isLoading) {
    return (
      <div className="page-card p-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="page-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
          <Store className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Información de la tienda</h2>
          <p className="text-xs text-gray-500 mt-0.5">Se muestra en la tienda pública · guardado en el servidor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((v) => updateConfig.mutateAsync(v))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nombre de la tienda *</label>
            <input {...register('nombre')} className="form-input" placeholder="Mi Tienda" />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="form-label">Dirección del local</label>
            <input {...register('direccion')} className="form-input" placeholder="Av. Corrientes 1234" />
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
          <button type="submit" disabled={updateConfig.isPending || !isDirty} className="btn-primary">
            {updateConfig.isPending
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Save className="w-4 h-4" /> Guardar cambios</>}
          </button>
          {!isDirty && <p className="text-xs text-gray-400">Sin cambios pendientes.</p>}
        </div>
      </form>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ADMIN MANAGEMENT
───────────────────────────────────────────── */
const createSchema = z.object({
  nombre:   z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const editSchema = z.object({
  nombre:   z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

function AdminManagementCard() {
  // Lista local de admins creados en esta sesión para poder editarlos/eliminarlos
  // (la API no tiene GET /admins, así que gestionamos los que creamos o agregamos manualmente)
  const [admins, setAdmins]           = useState([])
  const [showCreate, setShowCreate]   = useState(false)
  const [editTarget, setEditTarget]   = useState(null)   // { id, nombre }
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  /* ── Crear ── */
  const createForm = useForm({ resolver: zodResolver(createSchema) })

  async function handleCreate(values) {
    try {
      const result = await adminsApi.create(values)
      toast.success(`Administrador "${values.nombre}" creado.`)
      setAdmins((prev) => [...prev, { id: result.id, nombre: result.nombre }])
      createForm.reset()
      setShowCreate(false)
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  /* ── Editar ── */
  const editForm = useForm({ resolver: zodResolver(editSchema) })

  function openEdit(admin) {
    setEditTarget(admin)
    editForm.reset({ nombre: admin.nombre, password: '' })
  }

  async function handleEdit(values) {
    try {
      await adminsApi.update(editTarget.id, values)
      toast.success('Administrador actualizado.')
      setAdmins((prev) =>
        prev.map((a) => a.id === editTarget.id ? { ...a, nombre: values.nombre } : a)
      )
      setEditTarget(null)
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  /* ── Eliminar ── */
  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await adminsApi.remove(deleteTarget.id)
      toast.success(`Administrador "${deleteTarget.nombre}" eliminado.`)
      setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="page-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Administradores</h2>
              <p className="text-xs text-gray-500 mt-0.5">Crear, editar o eliminar cuentas de admin</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <UserPlus className="w-4 h-4" /> Nuevo admin
          </button>
        </div>

        {admins.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Los admins creados en esta sesión aparecerán aquí para que puedas editarlos o eliminarlos.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{admin.nombre}</p>
                  <p className="text-xs text-gray-400">ID: {admin.id}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(admin)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(admin)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gestión por ID manual (para admins existentes antes de esta sesión) */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3">
            Para editar o eliminar un admin ya existente ingresá su ID:
          </p>
          <QuickAdminActions
            onEdited={(admin) => {
              if (!admins.find((a) => a.id === admin.id)) {
                setAdmins((prev) => [...prev, admin])
              } else {
                setAdmins((prev) =>
                  prev.map((a) => a.id === admin.id ? { ...a, nombre: admin.nombre } : a)
                )
              }
            }}
            onDeleted={(id) => setAdmins((prev) => prev.filter((a) => a.id !== id))}
          />
        </div>
      </div>

      {/* Modal crear */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Administrador" size="sm">
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
          <div>
            <label className="form-label">Nombre de usuario</label>
            <input {...createForm.register('nombre')} className="form-input" placeholder="admin2" autoFocus />
            {createForm.formState.errors.nombre && (
              <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.nombre.message}</p>
            )}
          </div>
          <div>
            <label className="form-label">Contraseña</label>
            <input {...createForm.register('password')} type="password" className="form-input" placeholder="••••••••" />
            {createForm.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.password.message}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={createForm.formState.isSubmitting} className="btn-primary flex-[2] justify-center">
              {createForm.formState.isSubmitting
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Crear administrador'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal editar */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar Administrador" size="sm">
        <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
          <div>
            <label className="form-label">Nombre de usuario</label>
            <input {...editForm.register('nombre')} className="form-input" autoFocus />
            {editForm.formState.errors.nombre && (
              <p className="text-xs text-red-500 mt-1">{editForm.formState.errors.nombre.message}</p>
            )}
          </div>
          <div>
            <label className="form-label">Nueva contraseña</label>
            <input {...editForm.register('password')} type="password" className="form-input" placeholder="••••••••" />
            {editForm.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1">{editForm.formState.errors.password.message}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditTarget(null)} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={editForm.formState.isSubmitting} className="btn-primary flex-[2] justify-center">
              {editForm.formState.isSubmitting
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar administrador"
        message={`¿Eliminás al administrador "${deleteTarget?.nombre}" (ID: ${deleteTarget?.id})? Perderá acceso al sistema.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

/* Acceso rápido por ID para admins pre-existentes */
function QuickAdminActions({ onEdited, onDeleted }) {
  const [mode,     setMode]     = useState(null)   // 'edit' | 'delete'
  const [adminId,  setAdminId]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [editData, setEditData] = useState({ nombre: '', password: '' })

  async function handleDelete() {
    if (!adminId) return toast.error('Ingresá un ID.')
    setLoading(true)
    try {
      await adminsApi.remove(Number(adminId))
      toast.success(`Admin ID ${adminId} eliminado.`)
      onDeleted(Number(adminId))
      setAdminId(''); setMode(null)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  async function handleEdit() {
    if (!adminId || !editData.nombre || !editData.password) return toast.error('Completá todos los campos.')
    setLoading(true)
    try {
      await adminsApi.update(Number(adminId), editData)
      toast.success(`Admin ID ${adminId} actualizado.`)
      onEdited({ id: Number(adminId), nombre: editData.nombre })
      setAdminId(''); setEditData({ nombre: '', password: '' }); setMode(null)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="form-label">ID del administrador</label>
          <input
            type="number" min="1"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="form-input"
            placeholder="Ej: 2"
          />
        </div>
        <button onClick={() => setMode('edit')}   className="btn-secondary h-[38px]"><Pencil className="w-4 h-4" /> Editar</button>
        <button onClick={() => setMode('delete')} className="btn-danger   h-[38px]"><Trash2 className="w-4 h-4" /> Eliminar</button>
      </div>

      {mode === 'edit' && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600">Editar admin ID {adminId}</p>
          <input
            value={editData.nombre}
            onChange={(e) => setEditData((d) => ({ ...d, nombre: e.target.value }))}
            className="form-input" placeholder="Nuevo nombre de usuario"
          />
          <input
            type="password"
            value={editData.password}
            onChange={(e) => setEditData((d) => ({ ...d, password: e.target.value }))}
            className="form-input" placeholder="Nueva contraseña"
          />
          <div className="flex gap-2">
            <button onClick={() => setMode(null)} className="btn-secondary flex-1 justify-center text-xs">Cancelar</button>
            <button onClick={handleEdit} disabled={loading} className="btn-primary flex-[2] justify-center text-xs">
              {loading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {mode === 'delete' && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200 space-y-3">
          <p className="text-sm text-red-700">¿Eliminás al admin con ID <strong>{adminId}</strong>? Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <button onClick={() => setMode(null)} className="btn-secondary flex-1 justify-center text-xs">Cancelar</button>
            <button onClick={handleDelete} disabled={loading}
              className="flex-[2] inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 text-white
                         px-4 py-2 text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition-all">
              {loading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirmar eliminación'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   COMPANIES PREVIEW
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm mt-1">Personalizá tu tienda y gestioná accesos</p>
      </div>
      <StoreSettingsCard />
      <AdminManagementCard />
      <CompaniesPreviewCard />
    </div>
  )
}
