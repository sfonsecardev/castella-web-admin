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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { Delete, Edit } from '@mui/icons-material'
import api from '../api/axios'
import type { Usuario, Rol } from '../types'

const pageSize = 10

export default function UsersPage() {
  const [users, setUsers] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowCount, setRowCount] = useState(0)
  const [roles, setRoles] = useState<Rol[]>([])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [form, setForm] = useState({ nombre: '', correo: '', contrasenia: '', rol: '' })

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await api.get(`/usuarios/${page + 1}`)
    const items = data.items ?? data.data ?? data
    setUsers(items)
    setRowCount(data.total ?? items.length)
    setLoading(false)
  }

  const fetchRoles = async () => {
    const { data } = await api.get('/rols/')
    const list = Array.isArray(data) ? data : data.data ?? []
    setRoles(list)
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleSave = async () => {
    const payload = {
      nombre: form.nombre,
      correoPrincipal: form.correo,
      contrasenia: form.contrasenia,
      rol: form.rol,
    }
    if (editing) {
      await api.put(`/usuario/${editing._id}`, payload)
    } else {
      await api.post('/registrar', payload)
    }
    setOpen(false)
    fetchUsers()
  }

  const handleDelete = async (id: string) => {
    await api.delete(`/usuario/${id}`)
    fetchUsers()
  }

  const columns: GridColDef[] = [
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'correoPrincipal', headerName: 'Correo', flex: 1 },
    { field: 'rol', headerName: 'Rol', valueGetter: (p: any) => p.row?.rol?.nombre, flex: 1 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              const u = params.row as Usuario
              setEditing(u)
              setForm({ nombre: u.nombre, correo: u.correoPrincipal, contrasenia: '', rol: u.rol?._id })
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
        Usuarios
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => { setEditing(null); setForm({ nombre: '', correo: '', contrasenia: '', rol: '' }); setOpen(true) }}>Crear Usuario</Button>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
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
        <DialogTitle>{editing ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <TextField label="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
          {!editing && (
            <TextField label="Contraseña" type="password" value={form.contrasenia} onChange={(e) => setForm({ ...form, contrasenia: e.target.value })} />
          )}
          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select value={form.rol} label="Rol" onChange={(e) => setForm({ ...form, rol: e.target.value as string })}>
              {(Array.isArray(roles) ? roles : []).map((r) => (
                <MenuItem key={r._id} value={r._id}>
                  {r.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 