import { useEffect, useState } from 'react'
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import api from '../api/axios'
import type { OrdenDeTrabajo, Usuario } from '../types'

const pageSize = 10

export default function GuaranteesPage() {
  const [guarantees, setGuarantees] = useState<OrdenDeTrabajo[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowCount, setRowCount] = useState(0)
  const [tecnicos, setTecnicos] = useState<Usuario[]>([])

  const fetchGuarantees = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/garantias/pendientes/${page + 1}`)
      console.log('Guarantees response', data)
      const items = data.items ?? data.data ?? data
      setGuarantees(items)
      setRowCount(data.total ?? items.length)
    } finally {
      setLoading(false)
    }
  }

  const fetchTecnicos = async () => {
    const { data } = await api.get('/usuarios-rol/TECNICO')
    const list = Array.isArray(data) ? data : data.data ?? []
    setTecnicos(list)
  }

  useEffect(() => {
    fetchTecnicos()
  }, [])

  useEffect(() => {
    fetchGuarantees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleAssign = async (garantiaId: string, tecnicoId: string) => {
    await api.put(`/garantia/${garantiaId}/asignar-tecnico`, { tecnicoId })
    // Remove from list
    setGuarantees((prev) => prev.filter((g) => g._id !== garantiaId))
  }

  const columns: GridColDef[] = [
    { field: 'numero', headerName: 'Número', width: 120, valueGetter: (params: any) => params.row?.garantiaDe?.numero },
    {
      field: 'cliente',
      headerName: 'Cliente',
      flex: 1,
      valueGetter: (p: any) => p.row?.cliente?.nombre,
    },
    {
      field: 'action',
      headerName: 'Asignar Técnico',
      width: 250,
      renderCell: (params) => {
        const row = params.row as any
        return (
          <FormControl size="small" fullWidth>
            <Select
              value={''}
              displayEmpty
              onChange={(e) => handleAssign(row._id, e.target.value as string)}
            >
              <MenuItem value="" disabled>
                Seleccionar
              </MenuItem>
              {tecnicos.map((t) => (
                <MenuItem key={t._id} value={t._id}>
                  {t.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      },
    },
  ]

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Garantías Pendientes
      </Typography>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={guarantees}
          columns={columns}
          getRowId={(r) => r._id}
          paginationModel={{ pageSize, page }}
          paginationMode="server"
          rowCount={rowCount}
          loading={loading}
          onPaginationModelChange={(model: GridPaginationModel) => setPage(model.page)}
        />
      </div>
    </Box>
  )
} 