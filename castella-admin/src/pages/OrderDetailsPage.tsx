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
import { useParams, Link } from 'react-router-dom'
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
  const [fechaEjecucion, setFechaEjecucion] = useState(() => {
    // Set default to today's date in dd/mm/yyyy format
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}/${month}/${year}`
  })
  const [finalizationError, setFinalizationError] = useState('')
  
  // Success messages state
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Add scheduled date and time state
  const [fechaProgramada, setFechaProgramada] = useState('')
  const [horaProgramada, setHoraProgramada] = useState('')

  // Add state for referenced order (guarantee of)
  const [referencedOrder, setReferencedOrder] = useState<OrdenDeTrabajo | null>(null)
  const [referencedOrderLoading, setReferencedOrderLoading] = useState(false)

  const authUser = useAuthStore((s) => s.user)

  // Helper function to send notifications
  const sendNotificationToClient = async (title: string, body: string) => {
    if (order?.cliente?._id) {
      try {
        const notificationData = {
          title,
          body,
          usuarioId: order.cliente._id,
          orderId: order._id
        }

        console.log('Sending notification to client:', notificationData)
        await api.post('/enviar-notificacion/', notificationData)
        console.log('Notification sent successfully to client')
      } catch (notificationError) {
        console.error('Error sending notification to client:', notificationError)
        // Don't fail the whole operation if notification fails
      }
    }
  }

  // Helper function to send notifications to technician
  const sendNotificationToTechnician = async (title: string, body: string, tecnicoId?: string) => {
    const targetTecnicoId = tecnicoId || order?.tecnico?._id
    if (targetTecnicoId) {
      try {
        const notificationData = {
          title,
          body,
          usuarioId: targetTecnicoId
        }

        console.log('Sending notification to technician:', notificationData)
        await api.post('/enviar-notificacion/', notificationData)
        console.log('Notification sent successfully to technician')
      } catch (notificationError) {
        console.error('Error sending notification to technician:', notificationError)
        // Don't fail the whole operation if notification fails
      }
    }
  }

  // Function to fetch the referenced order (when this order is a guarantee of another order)
  const fetchReferencedOrder = async (garantiaDeId: string) => {
    setReferencedOrderLoading(true)
    try {
      const { data } = await api.get(`/orden/${garantiaDeId}`)
      const refOrder: OrdenDeTrabajo = data.ordenDeTrabajo ?? data.data ?? data
      setReferencedOrder(refOrder)
    } catch (error) {
      console.error('Error fetching referenced order:', error)
      setReferencedOrder(null)
    } finally {
      setReferencedOrderLoading(false)
    }
  }

  const fetchOrder = async () => {
    if (!id) return
    setLoading(true)
    try {
      const { data } = await api.get(`/orden/${id}`)
      const ord: OrdenDeTrabajo = data.ordenDeTrabajo ?? data.data ?? data
      setOrder(ord)
      setEstado(ord?.estado || '')
      
      // Set scheduled date and time if available
      if (ord?.fechaProgramada) {
        const date = new Date(ord.fechaProgramada)
        // Convert to dd/mm/yyyy format for display
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        setFechaProgramada(`${day}/${month}/${year}`)
        setHoraProgramada(date.toTimeString().split(' ')[0].substring(0, 5)) // HH:MM format
      }

      // Fetch referenced order if this order is a guarantee of another order
      if ((ord as any)?.garantiaDe) {
        fetchReferencedOrder((ord as any).garantiaDe)
      } else {
        setReferencedOrder(null)
      }
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

  // Add useEffect to populate fields when order is loaded
  useEffect(() => {
    if (order) {
      // Populate factura field if it exists in the order
      if (order.factura) {
        setFactura(order.factura)
      }
      // Populate periodicidad field if it exists in the order
      if ((order as any).periodicidadMeses) {
        setPeriodicidad((order as any).periodicidadMeses.toString())
      }
      // Populate fechaEjecucion field if it exists in the order
      if ((order as any).fechaEjecucion) {
        const date = new Date((order as any).fechaEjecucion)
        // Convert to dd/mm/yyyy format for display
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        setFechaEjecucion(`${day}/${month}/${year}`)
      }
    }
  }, [order])

  const handleAssignTecnico = async (tecnicoId: string) => {
    if (!id) return
    try {
      await api.put(`/orden/${id}`, { tecnico: tecnicoId })
      await fetchOrder()
      const tecnico = tecnicos.find(t => t._id === tecnicoId)
      const tecnicoName = tecnico?.nombre || 'Técnico'
      
      setSuccessMessage(`Técnico ${tecnicoName} asignado correctamente`)
      setShowSuccess(true)

      // Send notification to client about technician assignment
      const orderNumber = `${(order?.aniomesprogramacion as string) || ''}${order?.numero || ''}`
      await sendNotificationToClient(
        'Técnico Asignado',
        `Su orden ${orderNumber} ha sido asignada al técnico ${tecnicoName}. Pronto se pondrá en contacto con usted.`
      )

      // Send notification to technician about new assignment
      const clientName = order?.cliente?.nombre || 'Cliente'
      const serviceName = (order as any)?.servicio?.nombre || 'servicio'
      await sendNotificationToTechnician(
        'Nueva Orden Asignada',
        `Se le ha asignado la orden ${orderNumber} para el cliente ${clientName}. Servicio: ${serviceName}`,
        tecnicoId
      )
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

      // Send notification to client about status change
      const orderNumber = `${(order?.aniomesprogramacion as string) || ''}${order?.numero || ''}`
      let statusMessage = ''
      
      switch (newEstado) {
        case 'EN PROCESO':
        case 'EN EJECUCIÓN':
          statusMessage = `Su orden ${orderNumber} está ahora en proceso. El técnico ha comenzado a trabajar en su solicitud.`
          break
        case 'ASIGNADA':
          statusMessage = `Su orden ${orderNumber} ha sido asignada y será procesada pronto.`
          break
        case 'PENDIENTE':
          statusMessage = `Su orden ${orderNumber} está pendiente de procesamiento.`
          break
        default:
          statusMessage = `Su orden ${orderNumber} ha cambiado de estado a: ${newEstado}`
      }
      
      await sendNotificationToClient('Estado de Orden Actualizado', statusMessage)

      // Send notification to technician if there's one assigned
      if (order?.tecnico?._id) {
        await sendNotificationToTechnician(
          'Estado de Orden Actualizado',
          `La orden ${orderNumber} ha cambiado a estado: ${newEstado}`
        )
      }
    } catch (error) {
      console.error('Error changing status:', error)
      setFinalizationError('Error al cambiar el estado. Por favor, inténtelo de nuevo.')
    }
  }

  const handleUpdateSchedule = async () => {
    if (!id) return
    if (!fechaProgramada || !horaProgramada) {
      setFinalizationError('Fecha y hora son requeridas para programar la orden')
      return
    }

    try {
      // Convert dd/mm/yyyy format to ISO string
      const [day, month, year] = fechaProgramada.split('/')
      const scheduledDateTime = new Date(`${year}-${month}-${day}T${horaProgramada}:00`)
      
      await api.put(`/orden/${id}`, { 
        fechaProgramada: scheduledDateTime.toISOString() 
      })
      await fetchOrder()
      setSuccessMessage('Fecha y hora programada actualizada correctamente')
      setShowSuccess(true)

      // Send notification to client about schedule update
      const orderNumber = `${(order?.aniomesprogramacion as string) || ''}${order?.numero || ''}`
      const tecnicoName = order?.tecnico?.nombre || 'nuestro técnico'
      
      await sendNotificationToClient(
        'Visita Programada',
        `Su orden ${orderNumber} ha sido programada para el ${fechaProgramada} a las ${horaProgramada}. ${tecnicoName} lo visitará en la fecha indicada.`
      )

      // Send notification to technician about schedule update
      if (order?.tecnico?._id) {
        const clientName = order?.cliente?.nombre || 'Cliente'
        await sendNotificationToTechnician(
          'Cita Programada',
          `Su visita al cliente ${clientName} (orden ${orderNumber}) ha sido programada para el ${fechaProgramada} a las ${horaProgramada}.`
        )
      }
    } catch (error) {
      console.error('Error updating schedule:', error)
      setFinalizationError('Error al actualizar la programación. Por favor, inténtelo de nuevo.')
    }
  }

  const handleFinalize = async () => {
    if (!id) return
    
    // Validate that factura is required
    if (!factura.trim()) {
      setFinalizationError('El número de factura es obligatorio para finalizar la orden')
      return
    }
    
    // Validate that fechaEjecucion is required
    if (!fechaEjecucion.trim()) {
      setFinalizationError('La fecha de ejecución es obligatoria para finalizar la orden')
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
      
      // Include fechaEjecucion (now mandatory)
      // Convert dd/mm/yyyy format to ISO string
      const [day, month, year] = fechaEjecucion.split('/')
      const executionDate = new Date(`${year}-${month}-${day}`)
      payload.fechaEjecucion = executionDate.toISOString()
      
      await api.put(`/orden/${id}`, payload)
      await fetchOrder()
      setSuccessMessage('Orden finalizada correctamente')
      setShowSuccess(true)

      // Send notification to client about order completion
      const orderNumber = `${(order?.aniomesprogramacion as string) || ''}${order?.numero || ''}`
      const serviceName = (order as any)?.servicio?.nombre || 'el servicio'
      
      await sendNotificationToClient(
        'Orden Completada',
        `Su orden ${orderNumber} ha sido finalizada exitosamente. Gracias por confiar en nosotros para ${serviceName}. Factura: ${factura.trim()}`
      )

      // Send notification to technician about order completion
      if (order?.tecnico?._id) {
        const clientName = order?.cliente?.nombre || 'Cliente'
        await sendNotificationToTechnician(
          'Orden Finalizada',
          `La orden ${orderNumber} del cliente ${clientName} ha sido marcada como finalizada. Factura: ${factura.trim()}`
        )
      }

      // Clear the form fields after successful finalization
      setFactura('')
      setPeriodicidad('')
      setFechaEjecucion('')
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
      
      {/* Referenced Order Section - only show if this order is a guarantee of another order */}
      {(order as any)?.garantiaDe && (
        <>
          <Typography variant="h6" gutterBottom>
            Garantía de la Orden
          </Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            {referencedOrderLoading ? (
              <Typography>Cargando información de la orden referenciada...</Typography>
            ) : referencedOrder ? (
              <Box>
                <Typography variant="body1">
                  <strong>Orden Original:</strong>{' '}
                  <Link 
                    to={`/order/${referencedOrder._id}`}
                    style={{ 
                      textDecoration: 'none', 
                      color: '#1976d2',
                      fontWeight: 'bold'
                    }}
                  >
                    #{(referencedOrder.aniomesprogramacion as string) || ''}{referencedOrder.numero}
                  </Link>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cliente: {referencedOrder.cliente?.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estado: {referencedOrder.estado}
                </Typography>
                {referencedOrder.tecnico && (
                  <Typography variant="body2" color="text.secondary">
                    Técnico: {referencedOrder.tecnico.nombre}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography color="error">
                No se pudo cargar la información de la orden referenciada
              </Typography>
            )}
          </Paper>
        </>
      )}
      
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

      <Typography variant="h6">Programación de la Orden</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                     <TextField
             label="Fecha Programada"
             type="text"
             placeholder="dd/mm/yyyy"
             value={fechaProgramada}
             onChange={(e) => {
               setFechaProgramada(e.target.value)
               if (finalizationError) setFinalizationError('')
             }}
             InputLabelProps={{
               shrink: true,
             }}
             sx={{ flex: 2 }}
           />
          <TextField
            label="Hora"
            type="time"
            value={horaProgramada}
            onChange={(e) => {
              setHoraProgramada(e.target.value)
              if (finalizationError) setFinalizationError('')
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ flex: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={handleUpdateSchedule}
          disabled={!fechaProgramada || !horaProgramada || order.estado === 'FINALIZADO'}
          sx={{ mt: 1 }}
        >
          Actualizar Programación
        </Button>
      </Paper>

      <Typography variant="h6">Finalizar Orden</Typography>
      <Paper sx={{ p: 2 }}>
        {finalizationError && finalizationError.includes('factura') && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseError}>
            {finalizationError}
          </Alert>
        )}
                 <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
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
             InputProps={{
               readOnly: order.estado === 'FINALIZADO',
             }}
             sx={{ minWidth: 200 }}
           />
                       <TextField
              label="Fecha de Ejecución"
              type="text"
              placeholder="dd/mm/yyyy"
              value={fechaEjecucion}
              onChange={(e) => {
                setFechaEjecucion(e.target.value)
                if (finalizationError) setFinalizationError('')
              }}
              size="small"
              required
              error={finalizationError.includes('fecha de ejecución')}
              helperText="Campo obligatorio"
              InputProps={{
                readOnly: order.estado === 'FINALIZADO',
              }}
              sx={{ minWidth: 200 }}
            />
           <TextField
             label="Periodicidad Meses"
             value={periodicidad}
             onChange={(e) => setPeriodicidad(e.target.value)}
             size="small"
             type="number"
             helperText="Campo opcional"
             InputProps={{
               readOnly: order.estado === 'FINALIZADO',
             }}
             sx={{ minWidth: 150 }}
           />
           <Button
             variant="contained"
             disabled={order.estado === 'FINALIZADO'}
             onClick={handleFinalize}
             sx={{ minHeight: 40 }}
           >
             Finalizar
           </Button>
         </Box>
      </Paper>
    </Box>
  )
} 