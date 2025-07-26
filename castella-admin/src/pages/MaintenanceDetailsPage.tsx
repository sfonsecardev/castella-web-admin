import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  Button,
  Divider,
  CircularProgress
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import api from '../api/axios'
import type { MantenimientoPendiente } from '../types'

interface Direccion {
  _id: string
  direccion: string
  ciudad?: string
  departamento?: string
  referencias?: string
  [key: string]: unknown
}

export default function MaintenanceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [maintenance, setMaintenance] = useState<MantenimientoPendiente | null>(null)
  const [direccion, setDireccion] = useState<Direccion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMaintenanceDetails = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Get maintenance details from the list (we could also create a specific endpoint)
      const { data } = await api.get('/mantenimientos-pendientes')
      const maintenanceData = data.mantenimientos?.find((m: any) => m._id === id)
      
      if (!maintenanceData) {
        setError('Mantenimiento no encontrado')
        return
      }
      
      setMaintenance(maintenanceData)
      
      // Fetch address details if direccion ID exists
      if (maintenanceData.direccion) {
        try {
          const direccionResponse = await api.get(`/direccion/${maintenanceData.direccion}`)
          console.log('Direccion response:', direccionResponse.data)
          setDireccion(direccionResponse.data.direccion ?? direccionResponse.data)
        } catch (dirError) {
          console.error('Error fetching direccion:', dirError)
          // Don't set error, just continue without address details
        }
      }
    } catch (err: any) {
      console.error('Error fetching maintenance details:', err)
      setError(err?.response?.data?.mensaje ?? 'Error al cargar detalles del mantenimiento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaintenanceDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Fecha inválida'
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return 'Error de fecha'
    }
  }

  const getDaysChip = (days: number) => {
    if (days < 0) {
      return <Chip label={`${Math.abs(days)} días atrasado`} color="error" size="small" />
    } else if (days === 0) {
      return <Chip label="Hoy" color="warning" size="small" />
    } else if (days <= 7) {
      return <Chip label={`${days} días`} color="warning" size="small" />
    } else {
      return <Chip label={`${days} días`} color="info" size="small" />
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/maintenance')}
          sx={{ mb: 2 }}
        >
          Volver a Mantenimientos
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!maintenance) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/maintenance')}
          sx={{ mb: 2 }}
        >
          Volver a Mantenimientos
        </Button>
        <Alert severity="warning">Mantenimiento no encontrado</Alert>
      </Box>
    )
  }

  const orderNumber = `${maintenance.aniomesprogramacion || ''}${maintenance.numero || ''}`

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/maintenance')}
        sx={{ mb: 3 }}
      >
        Volver a Mantenimientos
      </Button>

      <Typography variant="h4" gutterBottom>
        Orden #{orderNumber}
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Detalles del Próximo Mantenimiento
      </Typography>

      <Grid container spacing={3}>
        {/* Cliente Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Cliente
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Nombre:</strong> {maintenance.cliente?.nombre || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Teléfono:</strong> {maintenance.cliente?.telefono || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Celular:</strong> {maintenance.cliente?.celular || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Correo:</strong> {maintenance.cliente?.correo || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        {/* Service Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Servicio
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Servicio:</strong> {maintenance.servicio?.nombre || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Tarea:</strong> {maintenance.tarea?.nombre || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Técnico Asignado:</strong> {maintenance.tecnico?.nombre || 'No asignado'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Email Técnico:</strong> {maintenance.tecnico?.correoPrincipal || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Dirección
            </Typography>
            {direccion ? (
              <>
                <Typography variant="body1" gutterBottom>
                  <strong>Dirección:</strong> {direccion.direccion || 'N/A'}
                </Typography>
                {direccion.ciudad && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Ciudad:</strong> {direccion.ciudad}
                  </Typography>
                )}
                {direccion.departamento && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Departamento:</strong> {direccion.departamento}
                  </Typography>
                )}
                {direccion.referencias && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Referencias:</strong> {direccion.referencias}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                {maintenance.direccion ? 'Cargando dirección...' : 'Dirección no disponible'}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Maintenance Schedule */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Programación
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Última Ejecución:</strong> {formatDate(maintenance.fechaEjecucion)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Próximo Mantenimiento:</strong> {formatDate(maintenance.proximoMantenimiento)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Periodicidad:</strong> {maintenance.periodicidadMeses} meses
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Estado:</strong> {getDaysChip(maintenance.diasHastaMantenimiento)}
            </Typography>
          </Paper>
        </Grid>

        {/* Order Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Información de la Orden
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Número:</strong> #{orderNumber}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Estado:</strong> {maintenance.estado}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Tipo:</strong> {maintenance.tipo || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Factura:</strong> {maintenance.factura || 'N/A'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Fecha Digitación:</strong> {formatDate(maintenance.fechaDigitacion || '')}
            </Typography>
            {maintenance.fechaProgramada && (
              <Typography variant="body1" gutterBottom>
                <strong>Fecha Programada:</strong> {formatDate(maintenance.fechaProgramada)}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Additional Information */}
        {(maintenance.digitador || maintenance.cerroOrden) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Personal
              </Typography>
              {maintenance.digitador && (
                <Typography variant="body1" gutterBottom>
                  <strong>Digitador:</strong> {maintenance.digitador.nombre}
                </Typography>
              )}
              {maintenance.cerroOrden && (
                <Typography variant="body1" gutterBottom>
                  <strong>Cerró Orden:</strong> {maintenance.cerroOrden.nombre}
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
} 