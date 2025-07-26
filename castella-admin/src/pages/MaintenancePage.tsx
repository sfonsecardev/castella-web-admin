import { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  Chip,
  Alert,
  Paper,
  Link
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import type { MantenimientoPendiente } from '../types'

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<MantenimientoPendiente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0) // 0-based for MUI DataGrid
  const [pageSize, setPageSize] = useState(25)
  const [rowCount, setRowCount] = useState(0)
  const navigate = useNavigate()

  const fetchMaintenances = async () => {
    setLoading(true)
    setError(null)
    try {
      // Convert 0-based page to 1-based for API
      const apiPage = page + 1
      const { data } = await api.get(`/mantenimientos-pendientes?page=${apiPage}&limit=${pageSize}`)
      
      console.log('=== MAINTENANCE API RESPONSE ===')
      console.log('Full response data:', JSON.stringify(data, null, 2))
      console.log('Pagination info:', {
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        hasNextPage: data.hasNextPage,
        hasPreviousPage: data.hasPreviousPage
      })
      
      const items = data.mantenimientos ?? []
      console.log('Processing items for DataGrid:', items.length)
      
      // Validate each item has required fields
      const validItems = items.filter(item => {
        const isValid = item && item._id && typeof item._id === 'string'
        if (!isValid) {
          console.warn('Invalid maintenance item:', item)
        }
        return isValid
      })
      
      console.log('Valid items after filtering:', validItems.length)
      setMaintenances(validItems)
      setRowCount(data.total || 0)
      
    } catch (err: any) {
      console.error('=== MAINTENANCE API ERROR ===')
      console.error('Error object:', err)
      console.error('Error response:', err?.response)
      console.error('Error response data:', err?.response?.data)
      console.error('Error message:', err?.message)
      console.error('=== END MAINTENANCE API ERROR ===')
      setError(err?.response?.data?.mensaje ?? 'Error al cargar mantenimientos pendientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaintenances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Fecha inválida'
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (e) {
      console.error('Error formatting date:', dateString, e)
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

  const columns: GridColDef[] = [
         { 
       field: 'numero', 
       headerName: 'Orden #', 
       width: 120,
       renderCell: (params) => {
         try {
           const aniomes = params.row?.aniomesprogramacion || ''
           const numero = params.row?.numero || ''
           const orderNumber = `#${aniomes}${numero}`
           return (
             <Link
               component="button"
               variant="body2"
               onClick={() => navigate(`/maintenance/${params.row._id}`)}
               sx={{ cursor: 'pointer', textDecoration: 'underline' }}
             >
               {orderNumber}
             </Link>
           )
         } catch (e) {
           console.error('Error rendering numero:', e)
           return '#N/A'
         }
       }
     },
         {
       field: 'cliente',
       headerName: 'Cliente',
       width: 250,
       valueGetter: (value: any, row: any) => {
         try {
           return row?.cliente?.nombre ?? 'N/A'
         } catch (e) {
           console.error('Error getting cliente:', e)
           return 'Error'
         }
       },
     },
    {
      field: 'servicio',
      headerName: 'Servicio',
      width: 200,
             valueGetter: (value: any, row: any) => {
         try {
           return row?.servicio?.nombre ?? 'N/A'
         } catch (e) {
           console.error('Error getting servicio:', e)
           return 'Error'
         }
       },
    },
    {
      field: 'tarea',
      headerName: 'Tarea',
      width: 200,
             valueGetter: (value: any, row: any) => {
         try {
           return row?.tarea?.nombre ?? 'N/A'
         } catch (e) {
           console.error('Error getting tarea:', e)
           return 'Error'
         }
       },
    },

    {
      field: 'fechaEjecucion',
      headerName: 'Última Ejecución',
      width: 130,
      valueGetter: (value: any, row: any) => {
        try {
          return row?.fechaEjecucion ? formatDate(row.fechaEjecucion) : 'N/A'
        } catch (e) {
          console.error('Error getting fechaEjecucion:', e)
          return 'Error'
        }
      },
    },
    {
      field: 'proximoMantenimiento',
      headerName: 'Próximo Mantto.',
      width: 130,
      valueGetter: (value: any, row: any) => {
        try {
          return row?.proximoMantenimiento ? formatDate(row.proximoMantenimiento) : 'N/A'
        } catch (e) {
          console.error('Error getting proximoMantenimiento:', e)
          return 'Error'
        }
      },
    },
    {
      field: 'periodicidadMeses',
      headerName: 'Periodicidad',
      width: 110,
      renderCell: (params) => {
        try {
          return `${params.value || 0} meses`
        } catch (e) {
          console.error('Error rendering periodicidadMeses:', e)
          return '0 meses'
        }
      }
    },
    {
      field: 'diasHastaMantenimiento',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => {
        try {
          return getDaysChip(params.value || 0)
        } catch (e) {
          console.error('Error rendering diasHastaMantenimiento:', e)
          return <Chip label="Error" color="default" size="small" />
        }
      }
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 120,
      valueGetter: (value: any, row: any) => {
        try {
          return row?.cliente?.telefono || row?.cliente?.celular || 'N/A'
        } catch (e) {
          console.error('Error getting telefono:', e)
          return 'Error'
        }
      },
    },
    {
      field: 'factura',
      headerName: 'Factura',
      width: 120,
      valueGetter: (value: any, row: any) => {
        try {
          return row?.factura ?? 'N/A'
        } catch (e) {
          console.error('Error getting factura:', e)
          return 'Error'
        }
      },
    }
  ]

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Próximos Mantenimientos
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

             <Paper sx={{ mb: 2, p: 2 }}>
         <Typography variant="body2" color="text.secondary">
           Esta vista muestra todas las órdenes finalizadas que requieren mantenimiento en los próximos 30 días, 
           basado en su periodicidad configurada. {rowCount > 0 && `Total: ${rowCount} mantenimientos pendientes.`}
         </Typography>
       </Paper>

      <div style={{ height: 700, width: '100%' }}>
        {(() => {
          try {
            console.log('Rendering DataGrid with', maintenances.length, 'rows')
            if (maintenances.length > 0) {
              console.log('Sample row for DataGrid:', JSON.stringify(maintenances[0], null, 2))
            }
            
            return (
                             <DataGrid
                 rows={maintenances}
                 columns={columns}
                 getRowId={(row) => row._id}
                 loading={loading}
                 
                 // Server-side pagination
                 paginationMode="server"
                 rowCount={rowCount}
                 paginationModel={{ page, pageSize }}
                 onPaginationModelChange={(model) => {
                   setPage(model.page)
                   setPageSize(model.pageSize)
                 }}
                 pageSizeOptions={[10, 25, 50, 100]}
                 
                 // Sorting (handled by server)
                 sortingMode="server"
                 
                 sx={{
                   '& .MuiDataGrid-row:hover': {
                     backgroundColor: 'rgba(0, 0, 0, 0.04)',
                   },
                 }}
                 onError={(error) => {
                   console.error('DataGrid error:', error)
                 }}
               />
            )
          } catch (e) {
            console.error('Error rendering DataGrid:', e)
            return (
              <Alert severity="error">
                Error al mostrar la tabla: {String(e)}
              </Alert>
            )
          }
        })()}
      </div>

      {maintenances.length === 0 && !loading && !error && (
        <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="text.secondary">
            No hay mantenimientos pendientes en los próximos 30 días
          </Typography>
        </Paper>
      )}
    </Box>
  )
} 