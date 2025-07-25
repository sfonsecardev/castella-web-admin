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
  Paper,
  Container,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import api from '../api/axios'
import type { OrdenDeTrabajo, Usuario } from '../types'
import { useNavigate, useLocation } from 'react-router-dom'

const pageSize = 10

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrdenDeTrabajo[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowCount, setRowCount] = useState(0)

  // filters
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  const [estado, setEstado] = useState(params.get('estado') ?? '')
  const [tecnico, setTecnico] = useState('')
  const [numero, setNumero] = useState('')
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
      let url = `/ordenes/${page + 1}`
      if (numero) {
        url = `/orden-numero/${numero}`
      } else if (tecnico) {
        url = `/orden-tecnico/${tecnico}`
      } else if (estado) {
        url = `/orden-filtro/${encodeURIComponent(estado)}` // fallback using filter contains status
      }

      const { data } = await api.get(url)
      console.log('Orders API response', data)

      let items: any[] = []
      let total = 0

      if (Array.isArray(data)) {
        items = data
        total = data.length
      } else if (Array.isArray(data.items)) {
        items = data.items
        total = data.total ?? items.length
      } else if (data.data && Array.isArray(data.data.items)) {
        items = data.data.items
        total = data.data.total ?? items.length
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data
        total = items.length
      } else if (data.orden) {
        // Handle single order response when searching by number
        items = [data.orden]
        total = 1
      } else if (data && data._id) {
        // Handle case where data is a single order object directly
        items = [data]
        total = 1
      }

      setOrders(items)
      setRowCount(total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const columns: GridColDef[] = [
    { 
      field: 'numeroCompleto', 
      headerName: 'Número', 
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const aniomes = params.row?.aniomesprogramacion || ''
        const numero = params.row?.numero || ''
        return `${aniomes}${numero}`
      }
    },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
            backgroundColor: 
              params.value === 'PENDIENTE' ? '#ffeb3b' :
              params.value === 'ASIGNADA' ? '#2196f3' :
              params.value === 'EN EJECUCIÓN' ? '#ff9800' :
              params.value === 'FINALIZADO' ? '#4caf50' : '#9e9e9e',
            color: 
              params.value === 'PENDIENTE' ? '#000' :
              params.value === 'ASIGNADA' ? '#fff' :
              params.value === 'EN EJECUCIÓN' ? '#fff' :
              params.value === 'FINALIZADO' ? '#fff' : '#fff',
          }}
        >
          {params.value}
        </Box>
      )
    },
    {
      field: 'cliente',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => params.row?.cliente?.nombre || 'Sin asignar',
    },
    {
      field: 'tecnico',
      headerName: 'Técnico',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => params.row?.tecnico?.nombre || 'Sin asignar',
    },
  ]

  return (
    <Container maxWidth={false} sx={{ px: 3, py: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
          Órdenes de Trabajo
        </Typography>
        
        {/* Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#666', mb: 2 }}>
            Filtros de búsqueda
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 3,
            alignItems: 'end'
          }}>
            <TextField
              label="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              size="small"
              fullWidth
              variant="outlined"
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select value={estado} label="Estado" onChange={(e) => setEstado(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                <MenuItem value="ASIGNADA">Asignada</MenuItem>
                <MenuItem value="EN EJECUCIÓN">En ejecución</MenuItem>
                <MenuItem value="FINALIZADO">Finalizado</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
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
            <Button 
              variant="contained" 
              onClick={() => fetchOrders()}
              size="medium"
              sx={{ 
                height: 40,
                px: 4,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Aplicar Filtros
            </Button>
          </Box>
        </Paper>

        {/* Data Grid */}
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ height: 700, width: '100%' }}>
            <DataGrid
              rows={orders}
              columns={columns}
              getRowId={(row) => row._id}
              pageSizeOptions={[pageSize]}
              paginationModel={{ pageSize, page }}
              paginationMode="server"
              rowCount={rowCount}
              loading={loading}
              onPaginationModelChange={(model: GridPaginationModel) => setPage(model.page)}
              onRowClick={(params) => navigate(`/order/${params.id}`)}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                  fontSize: '1rem',
                  fontWeight: 600,
                },
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f0f7ff',
                  },
                },
                '& .MuiDataGrid-cell': {
                  fontSize: '0.9rem',
                },
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  )
} 