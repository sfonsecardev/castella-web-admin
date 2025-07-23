import { Box, CssBaseline, Drawer, List, ListItemButton, ListItemText, Toolbar, AppBar, Typography, IconButton } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { menuConfig } from '../menuConfig'

const drawerWidth = 240

export default function MainLayout() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const items = menuConfig.filter((item) => user && item.roles.includes(user.rol?.nombre))

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            Castella Sagarra Mobile Backoffice
          </Typography>
          <IconButton color="inherit" onClick={() => { useAuthStore.getState().logout(); navigate('/login') }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {items.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemText primary={item.title} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          backgroundColor: 'background.default',
          minHeight: '100vh',
          overflowX: 'auto'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
} 