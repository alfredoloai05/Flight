import { Outlet, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, Stack } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';

export const AppLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const loc = useLocation();
  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Flight Requests</Typography>
          <Stack direction="row" spacing={1}>
            {!hasRole('admin') && (
              <>
                <Button color={loc.pathname === '/flights/new' ? 'secondary' : 'inherit'} component={Link} to="/flights/new">
                  Solicitar vuelo
                </Button>
                <Button color={loc.pathname.startsWith('/flights/mine') ? 'secondary' : 'inherit'} component={Link} to="/flights/mine">
                  Mis solicitudes
                </Button>
              </>
            )}

            {hasRole('operator') && (
              <Button color={loc.pathname.startsWith('/operator/pending') ? 'secondary' : 'inherit'} component={Link} to="/operator/pending">
                Pendientes
              </Button>
            )}

            {hasRole('admin') && (
              <Button color={loc.pathname.startsWith('/admin/destinations') ? 'secondary' : 'inherit'} component={Link} to="/admin/destinations">
                Destinos
              </Button>
            )}
          </Stack>

          <Typography sx={{ mx: 2 }}>{user?.username}</Typography>
          <Button onClick={logout} color="inherit">Salir</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}><Outlet /></Box>
    </Box>
  );
};