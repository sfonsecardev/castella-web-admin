import { create } from 'zustand'
import type { Usuario } from '../types'

type AuthState = {
  token: string | null
  user: Usuario | null
  login: (user: Usuario, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: (() => {
    const json = localStorage.getItem('user')
    return json ? (JSON.parse(json) as Usuario) : null
  })(),
  login: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },
})) 