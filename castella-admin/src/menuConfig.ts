import type { MenuItem } from './types'

export const menuConfig: MenuItem[] = [
  { title: 'Dashboard', path: '/dashboard', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  { title: 'Ordenes de Trabajo', path: '/orders', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  { title: 'Ordenes de Móvil', path: '/mobile-orders', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  { title: 'Garantias', path: '/guarantees', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  //{ title: 'Usuarios', path: '/users', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  //{ title: 'Clientes', path: '/clients', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  //{ title: 'System Admin', path: '/admin', roles: ['ADMINISTRADOR', 'SUPERVISOR', 'Super Admin'] },
  { title: 'Ratings', path: '/ratings', roles: ['ADMINISTRADOR', 'Super Admin'] },
] 