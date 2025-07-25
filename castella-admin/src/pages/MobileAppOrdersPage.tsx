import { useEffect, useState } from 'react'
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import api from '../api/axios'
import type { OrdenDeTrabajo, Usuario } from '../types'
import { useNavigate } from 'react-router-dom'

const pageSize = 10

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mobile-orders-tabpanel-${index}`}
      aria-labelledby={`mobile-orders-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function MobileAppOrdersPage() {
  const [orders, setOrders] = useState<OrdenDeTrabajo[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [currentTab, setCurrentTab] = useState(0)

  // filters
  const [tecnico, setTecnico] = useState('')
  const [numero, setNumero] = useState('')
  const [filtroTexto, setFiltroTexto] = useState('')
  const [tecnicos, setTecnicos] = useState<Usuario[]>([])

  // assignment modal
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrdenDeTrabajo | null>(null)
  const [assignedTecnico, setAssignedTecnico] = useState('')
  const [fechaProgramada, setFechaProgramada] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignError, setAssignError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    // load technicians dropdown once
    api
      .get('/usuarios-rol/TECNICO')
      .then((res) => {
        console.log('Technicians API Full Response:', res)
        console.log('Technicians API Response Data:', res.data)
        console.log('Response Data Type:', typeof res.data)
        console.log('Is Response Data Array?', Array.isArray(res.data))
        
        const payload = res.data
        let list: Usuario[] = []
        if (Array.isArray(payload)) {
          list = payload
          console.log('Using payload directly as array:', list)
        } else if (Array.isArray(payload.usuarios)) {
          list = payload.usuarios
          console.log('Using payload.usuarios as array:', list)
        } else if (Array.isArray(payload.data)) {
          list = payload.data
          console.log('Using payload.data as array:', list)
        } else {
          console.log('No array found in response. Payload structure:', payload)
        }
        
        console.log('Final technicians list:', list)
        console.log('Number of technicians:', list.length)
        setTecnicos(list)
      })
      .catch((error) => {
        console.error('Error fetching technicians:', error)
      })
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = ''
      let items: any[] = []

      if (numero) {
        // Search by number first, then filter for mobile app orders
        url = `/orden-numero/${numero}`
        const { data } = await api.get(url)
        
        if (data.orden) {
          // Check if this single order is from mobile app
          if (data.orden.tipo != null && data.orden.tipo !== undefined && data.orden.tipo !== '') {
            items = [data.orden]
          }
        }
      } else if (filtroTexto) {
        // Use mobile orders endpoint and client-side filter by text
        const queryParam = currentTab === 1 ? '?soloFinalizadas=true' : ''
        url = `/ordenes-mobile${queryParam}`
        const { data } = await api.get(url)
        
        items = data.ordenes || []
        // Client-side text filtering
        if (filtroTexto.trim()) {
          const searchText = filtroTexto.toLowerCase()
          items = items.filter(order => 
            (order.cliente?.nombre || '').toLowerCase().includes(searchText) ||
            (order.tecnico?.nombre || '').toLowerCase().includes(searchText) ||
            (order.notas || '').toLowerCase().includes(searchText) ||
            (order.resultadoGestion || '').toLowerCase().includes(searchText) ||
            String(order.numero || '').includes(searchText) ||
            (order.estado || '').toLowerCase().includes(searchText)
          )
        }
      } else {
        // Use mobile orders endpoint with status filtering
        const queryParams = new URLSearchParams()
        
        if (currentTab === 1) {
          queryParams.append('soloFinalizadas', 'true')
        }
        
        url = `/ordenes-mobile${queryParams.toString() ? '?' + queryParams.toString() : ''}`
        const { data } = await api.get(url)
        
        items = data.ordenes || []
      }

      // Apply technician filter if selected
      if (tecnico && items.length > 0) {
        items = items.filter(order => order.tecnico?._id === tecnico)
      }

      console.log('Mobile Orders API response', { items, url })
      setOrders(items)
    } catch (err) {
      console.error('Error fetching mobile orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, currentTab])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
    setPage(0) // Reset to first page when changing tabs
  }

  const handleViewDetails = (order: OrdenDeTrabajo) => {
    navigate(`/order/${order._id}`)
  }

  const handleAssignTechnician = (order: OrdenDeTrabajo) => {
    setSelectedOrder(order)
    setAssignedTecnico(order.tecnico?._id || '')
    
    // Set current values or defaults
    const currentDate = order.fechaProgramada ? 
      new Date(order.fechaProgramada).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0]
    setFechaProgramada(currentDate)
    
    setHoraInicio((order.horaInicio as string) || '09:00')
    setAssignError('')
    setAssignModalOpen(true)
  }

  const handleAssignSubmit = async () => {
    if (!selectedOrder || !assignedTecnico || !fechaProgramada || !horaInicio) {
      setAssignError('Todos los campos son obligatorios')
      return
    }

    setAssignLoading(true)
    setAssignError('')

    try {
      const updateData = {
        tecnico: assignedTecnico,
        fechaProgramada: `${fechaProgramada}T${horaInicio}:00.000Z`,
        horaInicio: horaInicio,
        estado: 'ASIGNADA' // Update status to assigned
      }

      await api.put(`/orden/${selectedOrder._id}`, updateData)
      
      // Send notification to client about technician assignment
      if (selectedOrder.cliente?._id) {
        try {
          const assignedTechnicianInfo = tecnicos.find(t => t._id === assignedTecnico)
          const technicianName = assignedTechnicianInfo?.nombre || 'Técnico'
          const formattedDate = new Date(fechaProgramada).toLocaleDateString('es-ES')
          const formattedTime = horaInicio
          
          const notificationData = {
            title: 'Técnico Asignado',
            body: `Su orden de trabajo ha sido asignada a ${technicianName}. Fecha de visita: ${formattedDate} a las ${formattedTime}`,
            usuarioId: selectedOrder.cliente._id
          }

          console.log('Notification data:', notificationData);

          await api.post('/enviar-notificacion/', notificationData)
          console.log('Notification sent successfully to client')
        } catch (notificationError) {
          console.error('Error sending notification to client:', notificationError)
          // Don't fail the whole operation if notification fails
        }
      }
      
      // Refresh the orders list
      await fetchOrders()
      
      // Close modal
      setAssignModalOpen(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error assigning technician:', error)
      setAssignError('Error al asignar el técnico. Intente nuevamente.')
    } finally {
      setAssignLoading(false)
    }
  }

  const getStatusChip = (estado: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default'
    
    switch (estado) {
      case 'PENDIENTE':
        color = 'warning'
        break
      case 'ASIGNADA':
        color = 'info'
        break
      case 'EN EJECUCIÓN':
      case 'EN PROCESO':
        color = 'primary'
        break
      case 'FINALIZADO':
        color = 'success'
        break
      default:
        color = 'default'
    }

    return <Chip label={estado} color={color} size="small" />
  }

  const columns: GridColDef[] = [
    { 
      field: 'numero', 
      headerName: 'Número', 
      width: 120,
      renderCell: (params) => {
        const yearMonth = params.row?.aniomesprogramacion || ''
        const numero = params.row?.numero || ''
        return `${yearMonth}${numero}`
      }
    },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 140,
      renderCell: (params) => getStatusChip(params.row?.estado || '')
    },
    {
      field: 'cliente',
      headerName: 'Cliente',
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value, row) => {
        return row?.cliente?.nombre || 'N/A'
      },
    },
    {
      field: 'tecnico',
      headerName: 'Técnico',
      flex: 1.5,
      minWidth: 180,
      valueGetter: (value, row) => {
        return row?.tecnico?.nombre || 'No asignado'
      },
    },
    {
      field: 'fechaProgramada',
      headerName: 'Fecha Programada',
      width: 160,
      valueGetter: (value, row) => {
        const fecha = row?.fechaProgramada
        return fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'N/A'
      },
    },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row?.tipo || 'MOBILE'} 
          color="secondary" 
          size="small" 
          variant="outlined"
        />
      ),
    },
    {
      field: 'servicio',
      headerName: 'Servicio',
      width: 200,
      valueGetter: (value, row) => {
        return row?.servicio?.nombre || 'N/A'
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleViewDetails(params.row)
            }}
            title="Ver detalles"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {currentTab === 0 && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleAssignTechnician(params.row)
              }}
              title="Asignar técnico"
              color="primary"
            >
              <AssignmentIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ]

  const handleClearFilters = () => {
    setNumero('')
    setTecnico('')
    setFiltroTexto('')
    setTimeout(fetchOrders, 100)
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Órdenes de Trabajo - App Móvil
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Órdenes de trabajo enviadas por clientes desde la aplicación móvil
      </Typography>

      {/* Tabs for Active vs Completed orders */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="mobile orders tabs">
          <Tab label="Órdenes Activas" />
          <Tab label="Órdenes Finalizadas" />
        </Tabs>
      </Box>

      {/* Filters */}
      <TabPanel value={currentTab} index={0}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            size="small"
            placeholder="Ej: 2023121234"
            sx={{ minWidth: 150 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Técnico</InputLabel>
            <Select value={tecnico} label="Técnico" onChange={(e) => setTecnico(e.target.value as string)}>
              <MenuItem value="">Todos</MenuItem>
              {(Array.isArray(tecnicos) ? tecnicos : []).map((t) => (
                <MenuItem key={t._id} value={t._id}>
                  {t.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Buscar texto"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            size="small"
            placeholder="Buscar por cliente, notas, etc."
            sx={{ minWidth: 200 }}
          />
          <Button variant="contained" onClick={fetchOrders}>
            Aplicar
          </Button>
          <Button variant="outlined" onClick={handleClearFilters}>
            Limpiar
          </Button>
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            size="small"
            placeholder="Ej: 2023121234"
            sx={{ minWidth: 150 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Técnico</InputLabel>
            <Select value={tecnico} label="Técnico" onChange={(e) => setTecnico(e.target.value as string)}>
              <MenuItem value="">Todos</MenuItem>
              {(Array.isArray(tecnicos) ? tecnicos : []).map((t) => (
                <MenuItem key={t._id} value={t._id}>
                  {t.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Buscar texto"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            size="small"
            placeholder="Buscar por cliente, notas, etc."
            sx={{ minWidth: 200 }}
          />
          <Button variant="contained" onClick={fetchOrders}>
            Aplicar
          </Button>
          <Button variant="outlined" onClick={handleClearFilters}>
            Limpiar
          </Button>
        </Box>
      </TabPanel>

      <Box sx={{ 
        height: 600, 
        width: '100%', 
        backgroundColor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden',
        '& .MuiDataGrid-root': {
          backgroundColor: 'background.paper',
        }
      }}>
        <DataGrid
          rows={orders}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[pageSize]}
          paginationModel={{ pageSize, page }}
          paginationMode="client"
          loading={loading}
          onPaginationModelChange={(model: GridPaginationModel) => setPage(model.page)}
          onRowClick={(params) => navigate(`/order/${params.id}`)}
          sx={{
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer',
            },
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
            },
          }}
        />
      </Box>
      
      {/* Summary info */}
      {!loading && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {orders.length} órdenes de trabajo de la app móvil
            {currentTab === 0 ? ' (activas)' : ' (finalizadas)'}
          </Typography>
        </Box>
      )}

      {/* Assignment Modal */}
      <Dialog open={assignModalOpen} onClose={() => setAssignModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Asignar Técnico y Programar
        </DialogTitle>
        {selectedOrder && (
          <Box sx={{ px: 3, pb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Orden #{(selectedOrder.aniomesprogramacion as string) || ''}{selectedOrder.numero || ''} - {selectedOrder.cliente?.nombre || ''}
            </Typography>
          </Box>
        )}
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {assignError && (
              <Alert severity="error">{assignError}</Alert>
            )}
            <FormControl fullWidth>
              <InputLabel>Técnico</InputLabel>
              <Select
                value={assignedTecnico}
                label="Técnico"
                onChange={(e) => setAssignedTecnico(e.target.value as string)}
              >
                <MenuItem value="">Seleccionar técnico</MenuItem>
                {tecnicos.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Fecha Programada"
                type="date"
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flex: 2 }}
              />
              <TextField
                label="Hora"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignModalOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAssignSubmit} 
            variant="contained"
            disabled={assignLoading}
          >
            {assignLoading ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 