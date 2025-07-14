import { useEffect, useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface Stats {
  sinAsignar: number
  enEjecucion: number
  sinMovimiento5d: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard/overview').then((res) => {
      setStats(res.data.data ?? res.data)
    })
  }, [])

  const cards = [
    {
      title: 'Órdenes sin Asignar',
      value: stats?.sinAsignar ?? '--',
      filter: 'PENDIENTE',
    },
    {
      title: 'Órdenes en Ejecución',
      value: stats?.enEjecucion ?? '--',
      filter: 'EN EJECUCIÓN',
    },
    {
      title: 'Sin Movimiento >5 días',
      value: stats?.sinMovimiento5d ?? '--',
      filter: '',
    },
  ]

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {cards.map((c) => (
          <Paper
            key={c.title}
            sx={{ p: 3, textAlign: 'center', cursor: 'pointer', flex: '1 1 250px' }}
            onClick={() => navigate(`/orders?estado=${encodeURIComponent(c.filter)}`)}
          >
            <Typography variant="h6">{c.title}</Typography>
            <Typography variant="h3">{c.value}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  )
} 