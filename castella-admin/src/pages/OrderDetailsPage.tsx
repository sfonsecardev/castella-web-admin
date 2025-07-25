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
  Alert,
  Snackbar,
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
  const [finalizationError, setFinalizationError] = useState('')
  
  // Success messages state
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

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
    try {
      await api.put(`/orden/${id}`, { tecnico: tecnicoId })
      await fetchOrder()
      const tecnico = tecnicos.find(t => t._id === tecnicoId)
      setSuccessMessage(`Técnico ${tecnico?.nombre || 'asignado'} asignado correctamente`)
      setShowSuccess(true)
    } catch (error) {
      console.error('Error assigning technician:', error)
      setFinalizationError('Error al asignar técnico. Por favor, inténtelo de nuevo.')
    }
  }

  const handleChangeEstado = async (newEstado: string) => {
    if (!id) return
    try {
      await api.put(`/orden/${id}`, { estado: newEstado })
      await fetchOrder()
      setSuccessMessage(`Estado cambiado a "${newEstado}" correctamente`)
      setShowSuccess(true)
    } catch (error) {
      console.error('Error changing status:', error)
      setFinalizationError('Error al cambiar el estado. Por favor, inténtelo de nuevo.')
    }
  }



  const handleFinalize = async () => {
    if (!id) return
    
    // Validate that factura is required
    if (!factura.trim()) {
      setFinalizationError('El número de factura es obligatorio para finalizar la orden')
      return
    }
    
    setFinalizationError('')
    
    try {
      const payload: any = {
        factura: factura.trim(),
        estado: 'FINALIZADO',
      }
      
      // Only include periodicidadMeses if it has a value
      if (periodicidad.trim()) {
        payload.periodicidadMeses = Number(periodicidad)
      }
      
      await api.put(`/orden/${id}`, payload)
      await fetchOrder()
      setSuccessMessage('Orden finalizada correctamente')
      setShowSuccess(true)
      // Clear the form fields after successful finalization
      setFactura('')
      setPeriodicidad('')
    } catch (error) {
      console.error('Error finalizing order:', error)
      setFinalizationError('Error al finalizar la orden. Por favor, inténtelo de nuevo.')
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    setSuccessMessage('')
  }

  const handleCloseError = () => {
    setFinalizationError('')
  }

  if (loading || !order) return <div>Cargando...</div>

  return (
    <Box>
      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Typography variant="h5" gutterBottom>
        Orden #{(order.aniomesprogramacion as string) || ''}{order.numero}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {/* Error Alert for general errors */}
      {finalizationError && !finalizationError.includes('factura') && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseError}>
          {finalizationError}
        </Alert>
      )}

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
        {finalizationError && finalizationError.includes('factura') && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseError}>
            {finalizationError}
          </Alert>
        )}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Número de Factura"
            value={factura}
            onChange={(e) => {
              setFactura(e.target.value)
              if (finalizationError) setFinalizationError('')
            }}
            size="small"
            required
            error={finalizationError.includes('factura')}
            helperText="Campo obligatorio"
          />
          <TextField
            label="Periodicidad Meses"
            value={periodicidad}
            onChange={(e) => setPeriodicidad(e.target.value)}
            size="small"
            type="number"
            helperText="Campo opcional"
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