import { createBrowserRouter, Navigate } from 'react-router-dom'
import StorePage      from '@/pages/store/StorePage'
import AdminLayout    from '@/pages/admin/AdminLayout'
import DashboardPage  from '@/pages/admin/DashboardPage'
import ProductsPage   from '@/pages/admin/ProductsPage'
import CategoriesPage from '@/pages/admin/CategoriesPage'
import CompaniesPage  from '@/pages/admin/CompaniesPage'
import SalesPage      from '@/pages/admin/SalesPage'
import SettingsPage   from '@/pages/admin/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StorePage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true,           element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',     element: <DashboardPage /> },
      { path: 'productos',     element: <ProductsPage /> },
      { path: 'categorias',    element: <CategoriesPage /> },
      { path: 'companias',     element: <CompaniesPage /> },
      { path: 'ventas',        element: <SalesPage /> },
      { path: 'configuracion', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
