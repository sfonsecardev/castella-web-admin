import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { Delete, Edit } from '@mui/icons-material'
import api from '../api/axios'
import type { Cliente } from '../types'

const pageSize = 10

export default function ClientsPage() {
  const [clients, setClients] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowCount, setRowCount] = useState(0)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', celular: '' })

  const fetchClients = async () => {
    setLoading(true)
    const endpoint = `/clientes/${page + 1}`
    const { data } = await api.get(endpoint)
    const items = data.items ?? data.data ?? data
    setClients(items)
    setRowCount(data.total ?? items.length)
    setLoading(false)
  }

  useEffect(() => {
    fetchClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleSave = async () => {
    const payload = {
      nombre: form.nombre,
      correo: form.correo,
      telefono: form.telefono,
      celular: form.celular,
    }
    if (editing) {
      await api.put(`/cliente/${editing._id}`, payload)
    } else {
      await api.post('/cliente', payload)
    }
    setOpen(false)
    fetchClients()
  }

  const handleDelete = async (id: string) => {
    await api.delete(`/cliente/${id}`)
    fetchClients()
  }

  const columns: GridColDef[] = [
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'correo', headerName: 'Correo', flex: 1 },
    { field: 'telefono', headerName: 'Teléfono', width: 120 },
    { field: 'celular', headerName: 'Celular', width: 120 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              const c = params.row as Cliente
              setEditing(c)
              setForm({ nombre: c.nombre, correo: c.correo ?? '', telefono: c.telefono ?? '', celular: c.celular ?? '' })
              setOpen(true)
            }}
          >
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)}>
            <Delete />
          </IconButton>
        </>
      ),
    },
  ]

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Clientes
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => { setEditing(null); setForm({ nombre: '', correo: '', telefono: '', celular: '' }); setOpen(true) }}>Crear Cliente</Button>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={clients}
          columns={columns}
          getRowId={(r) => r._id}
          paginationModel={{ pageSize, page }}
          pageSizeOptions={[pageSize]}
          paginationMode="server"
          rowCount={rowCount}
          loading={loading}
          onPaginationModelChange={(m: GridPaginationModel) => setPage(m.page)}
        />
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar Cliente' : 'Crear Cliente'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <TextField label="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
          <TextField label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <TextField label="Celular" value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 