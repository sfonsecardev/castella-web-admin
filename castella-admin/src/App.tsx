import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import MainLayout from './layouts/MainLayout'
import OrdersPage from './pages/OrdersPage'
import MobileAppOrdersPage from './pages/MobileAppOrdersPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import GuaranteesPage from './pages/GuaranteesPage'
import MaintenancePage from './pages/MaintenancePage'
import MaintenanceDetailsPage from './pages/MaintenanceDetailsPage'
import RatingsPage from './pages/RatingsPage'
import UsersPage from './pages/UsersPage'
import ClientsPage from './pages/ClientsPage'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/mobile-orders" element={<MobileAppOrdersPage />} />
          <Route path="/order/:id" element={<OrderDetailsPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetailsPage />} />
          <Route path="/guarantees" element={<GuaranteesPage />} />
          <Route path="/ratings" element={<RatingsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          {/* Other protected routes can be added here */}
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
