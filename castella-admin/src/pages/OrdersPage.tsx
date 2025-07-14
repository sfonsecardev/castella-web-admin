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
      let url = `/ordenes/${page + 1}`
      if (numero) {
        url = `/orden-numero/${numero}`
      } else if (filtroTexto) {
        url = `/orden-filtro/${encodeURIComponent(filtroTexto)}`
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
    { field: 'numero', headerName: 'Número', width: 120 },
    { field: 'estado', headerName: 'Estado', width: 120 },
    {
      field: 'cliente',
      headerName: 'Cliente',
      flex: 1,
      valueGetter: (params: any) => params.row?.cliente?.nombre,
    },
    {
      field: 'tecnico',
      headerName: 'Técnico',
      flex: 1,
      valueGetter: (params: any) => params.row?.tecnico?.nombre,
    },
  ]

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Órdenes de Trabajo
      </Typography>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Número"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          size="small"
        />
        <FormControl size="small">
          <InputLabel>Estado</InputLabel>
          <Select value={estado} label="Estado" onChange={(e) => setEstado(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="PENDIENTE">Pendiente</MenuItem>
            <MenuItem value="ASIGNADA">Asignada</MenuItem>
            <MenuItem value="EN EJECUCIÓN">En ejecución</MenuItem>
            <MenuItem value="FINALIZADO">Finalizado</MenuItem>
          </Select>
        </FormControl>
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
        />
        <Button variant="contained" onClick={() => fetchOrders()}>
          Aplicar
        </Button>
      </Box>

      <div style={{ height: 600, width: '100%' }}>
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
        />
      </div>
    </Box>
  )
} 