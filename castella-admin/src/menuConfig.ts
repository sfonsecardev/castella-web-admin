import type { MenuItem } from './types'

export const menuConfig: MenuItem[] = [
  { title: 'Dashboard', path: '/dashboard', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  { title: 'Orders', path: '/orders', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  { title: 'Guarantees', path: '/guarantees', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  { title: 'Users', path: '/users', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  { title: 'Clients', path: '/clients', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  { title: 'System Admin', path: '/admin', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
] 