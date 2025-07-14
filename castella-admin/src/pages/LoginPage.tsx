import { useState } from 'react'
import { Box, Button, TextField, Typography, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/auth'
import type { Usuario } from '../types'

export default function LoginPage() {
  const [correoPrincipal, setCorreoPrincipal] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      // First request: ask for token (assuming API returns raw token or { token })
      const tokenResp = await api.post('/login', {
        correoPrincipal,
        contrasenia,
        gethash: true,
      })

      console.log('Token response', tokenResp.data)

      // API returns { ok, message, data } with token in data (string)
      const token: string | undefined =
        typeof tokenResp.data === 'string'
          ? tokenResp.data
          : typeof tokenResp.data.data === 'string'
          ? tokenResp.data.data
          : tokenResp.data.token

      if (!token) {
        throw new Error('Token not found in response')
      }

      // Second request: obtain user object (without password)
      const userResp = await api.post('/login', {
        correoPrincipal,
        contrasenia,
      })

      console.log('User response', userResp.data)

      // User object is in userResp.data.data
      const usuario: Usuario = (
        userResp.data?.data ?? userResp.data.usuario ?? userResp.data
      ) as Usuario

      login(usuario, token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? 'Error de autenticación')
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Iniciar Sesión
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Correo"
            value={correoPrincipal}
            onChange={(e) => setCorreoPrincipal(e.target.value)}
            required
            type="email"
          />
          <TextField
            label="Contraseña"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            required
            type="password"
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button variant="contained" type="submit">
            Entrar
          </Button>
        </Box>
      </Paper>
    </Box>
  )
} 