import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Divider,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Paper,
} from '@mui/material'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import type { OrdenDeTrabajo, Usuario } from '../types'
import { useAuthStore } from '../store/auth'

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrdenDeTrabajo | null>(null)
  const [loading, setLoading] = useState(false)
  const [tecnicos, setTecnicos] = useState<Usuario[]>([])
  const [estado, setEstado] = useState('')

  const [factura, setFactura] = useState('')
  const [periodicidad, setPeriodicidad] = useState('')

  const authUser = useAuthStore((s) => s.user)

  const fetchOrder = async () => {
    if (!id) return
    setLoading(true)
    try {
      const { data } = await api.get(`/orden/${id}`)
      const ord: OrdenDeTrabajo = data.ordenDeTrabajo ?? data.data ?? data
      setOrder(ord)
      setEstado(ord?.estado || '')
    } catch (error) {
      console.error('Error fetching order:', error)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchTecnicos = async () => {
    try {
      const { data } = await api.get('/usuarios-rol/TECNICO')
      // Handle the response structure: {usuarios: Array}
      let list: Usuario[] = []
      if (Array.isArray(data)) {
        list = data
      } else if (Array.isArray(data.usuarios)) {
        list = data.usuarios
      } else if (Array.isArray(data.data)) {
        list = data.data
      }
      setTecnicos(list)
    } catch (error) {
      console.error('Error fetching technicians:', error)
      setTecnicos([]) // Set empty array on error
    }
  }



  useEffect(() => {
    fetchOrder()
    fetchTecnicos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleAssignTecnico = async (tecnicoId: string) => {
    if (!id) return
    await api.put(`/orden/${id}`, { tecnico: tecnicoId })
    fetchOrder()
  }

  const handleChangeEstado = async (newEstado: string) => {
    if (!id) return
    await api.put(`/orden/${id}`, { estado: newEstado })
    fetchOrder()
  }



  const handleFinalize = async () => {
    if (!id) return
    if (!factura || !periodicidad) return
    await api.put(`/orden/${id}`, {
      factura,
      periodicidadMeses: Number(periodicidad),
      estado: 'FINALIZADO',
    })
    fetchOrder()
  }

  if (loading || !order) return <div>Cargando...</div>

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Orden #{(order.aniomesprogramacion as string) || ''}{order.numero}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6">Información del Cliente</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <div>Nombre: {order.cliente?.nombre}</div>
      </Paper>

      <Typography variant="h6">Detalles de la Orden</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <div>Estado: {order.estado}</div>
        <FormControl size="small" sx={{ mt: 1, minWidth: 160 }}>
          <InputLabel>Actualizar Estado</InputLabel>
          <Select value={estado} label="Actualizar Estado" onChange={(e) => {
            const val = e.target.value
            setEstado(val)
            handleChangeEstado(val)
          }}>
            <MenuItem value="PENDIENTE">Pendiente</MenuItem>
            <MenuItem value="ASIGNADA">Asignada</MenuItem>
            <MenuItem value="EN EJECUCIÓN">En ejecución</MenuItem>
            <MenuItem value="FINALIZADO">Finalizado</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ mt: 1, minWidth: 160 }}>
          <InputLabel>Asignar Técnico</InputLabel>
          <Select
            value={order.tecnico?._id ?? ''}
            label="Asignar Técnico"
            onChange={(e) => handleAssignTecnico(e.target.value)}
          >
            {(Array.isArray(tecnicos) ? tecnicos : []).map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>



      <Typography variant="h6">Finalizar Orden</Typography>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Número de Factura"
            value={factura}
            onChange={(e) => setFactura(e.target.value)}
            size="small"
          />
          <TextField
            label="Periodicidad Meses"
            value={periodicidad}
            onChange={(e) => setPeriodicidad(e.target.value)}
            size="small"
            type="number"
          />
          <Button
            variant="contained"
            disabled={order.estado === 'FINALIZADO'}
            onClick={handleFinalize}
          >
            Finalizar
          </Button>
        </Box>
      </Paper>
    </Box>
  )
} 