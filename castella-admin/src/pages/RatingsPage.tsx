import { useEffect, useState } from 'react'
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import api from '../api/axios'
import type { Usuario } from '../types'
import { BarChart } from '@mui/x-charts'

export default function RatingsPage() {
  const [tecnicos, setTecnicos] = useState<Usuario[]>([])
  const [selected, setSelected] = useState('')
  const [stats, setStats] = useState<any | null>(null)

  useEffect(() => {
    api.get('/usuarios-rol/TECNICO').then((res) => {
      console.log('API Response for technicians:', res)
      console.log('Response data:', res.data)
      
      // Handle different response structures:
      // 1. Direct array: res.data = [...]
      // 2. Nested in data: res.data = {data: [...]}
      // 3. Nested in usuarios: res.data = {usuarios: [...]}
      const data = Array.isArray(res.data) 
        ? res.data 
        : res.data.usuarios ?? res.data.data ?? []
      
      console.log('Processed data:', data)
      console.log('Data length:', data.length)
      
      setTecnicos(data)
    }).catch((error) => {
      console.error('Error fetching technicians:', error)
      console.error('Error response:', error.response)
    })
  }, [])

  const fetchStats = (id: string) => {
    api.get(`/calificaciones-tecnico/${id}`).then((res) => {
      setStats(res.data.data ?? res.data)
    })
  }

  const distribution = stats?.distribucion ?? {}
  const bars = Object.keys(distribution).map((k) => ({ star: k, count: distribution[k] }))

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Calificaciones de Técnicos
      </Typography>
      <FormControl size="small" sx={{ minWidth: 240 }}>
        <InputLabel>Técnico</InputLabel>
        <Select
          value={selected}
          label="Técnico"
          onChange={(e) => {
            const val = e.target.value as string
            setSelected(val)
            fetchStats(val)
          }}
        >
          {tecnicos.map((t) => (
            <MenuItem key={t._id} value={t._id}>
              {t.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {stats && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Promedio: {stats.promedio}</Typography>
          <Typography variant="body1">Total calificaciones: {stats.total}</Typography>
          <BarChart
            dataset={bars}
            xAxis={[{ scaleType: 'band', dataKey: 'star' }]}
            series={[{ dataKey: 'count' }]}
            height={300}
          />
        </Box>
      )}
    </Box>
  )
} 