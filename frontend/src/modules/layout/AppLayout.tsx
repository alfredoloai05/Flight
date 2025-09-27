import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import SidebarNav, { useDrawerWidth } from './SidebarNav';
import SettingsIcon from '@mui/icons-material/Settings';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const drawerWidth = useDrawerWidth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openInfo, setOpenInfo] = useState(false);

  const open = Boolean(anchorEl);
  const handleMenu = (event: React.MouseEvent<HTMLButtonElement>) => { setAnchorEl(event.currentTarget); };
  const handleClose = () => setAnchorEl(null);

  return (
    <Box sx={{ minHeight: '100%', display: 'flex' }}>
      <AppBar position="fixed" color="primary" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component={Link} to="/new" sx={{ textDecoration: 'none', color: 'inherit' }}>
            Flights
          </Typography>
          <Box sx={{ flex: 1 }} />
          {user ? (
            <>
              <Typography variant="body2" sx={{ mr: 1, color: 'inherit' }}>{user.username}</Typography>
              <IconButton color="inherit" onClick={handleMenu} size="small">
                <Avatar alt={user.username} sx={{ width: 32, height: 32 }} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={() => { setOpenInfo(true); handleClose(); }}>
                  <SettingsIcon fontSize="small" style={{ marginRight: 8 }} /> Cambiar clave
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); logout(); }}>Salir</MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={Link} to="/login" variant="outlined" sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.6)' }}>Ingresar</Button>
          )}
        </Toolbar>
      </AppBar>

      <SidebarNav />

      <Box component="main" sx={{ flex: 1, p: 3, ml: `${drawerWidth}px`, mt: '64px' }}>
        <Container maxWidth="md" sx={{ py: 2 }}>
          <Outlet />
        </Container>
        <Box component="footer" sx={{ py: 2, textAlign: 'center', color: 'text.secondary', borderTop: 1, borderColor: 'divider' }}>
          Demo · Django + React
        </Box>
      </Box>

      <Dialog open={openInfo} onClose={()=>setOpenInfo(false)}>
        <DialogTitle>Información</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Las instrucciones para cambiar la clave y el enlace de cierre de sesión han sido enviadas a su correo.
            Para el demo, estas opciones son simuladas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenInfo(false)}>Entendido</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}