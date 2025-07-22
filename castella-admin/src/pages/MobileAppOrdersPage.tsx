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
} from '@mui/material'
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

  const navigate = useNavigate()

  useEffect(() => {
    // load technicians dropdown once
    api
      .get('/usuarios-rol/TECNICO')
      .then((res) => {
        console.log('Technicians API response', res.data)
        const payload = res.data
        let list: Usuario[] = []
        if (Array.isArray(payload)) list = payload
        else if (Array.isArray(payload.data)) list = payload.data
        setTecnicos(list)
      })
      .catch(() => {})
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
      flex: 1,
      valueGetter: (value, row) => {
        return row?.cliente?.nombre || 'N/A'
      },
    },
    {
      field: 'tecnico',
      headerName: 'Técnico',
      flex: 1,
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
            <Select value={tecnico} label="Técnico" onChange={(e) => setTecnico(e.target.value)}>
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
            <Select value={tecnico} label="Técnico" onChange={(e) => setTecnico(e.target.value)}>
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

      <div style={{ height: 600, width: '100%' }}>
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
          }}
        />
      </div>
      
      {/* Summary info */}
      {!loading && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {orders.length} órdenes de trabajo de la app móvil
            {currentTab === 0 ? ' (activas)' : ' (finalizadas)'}
          </Typography>
        </Box>
      )}
    </Box>
  )
} 