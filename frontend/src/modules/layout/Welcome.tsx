import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Welcome() {
  const { user } = useAuth();
  return (
    <Box sx={{ py: 6, display: 'grid', gap: 3 }}>
      <Typography variant="h4" fontWeight={700} color="primary">
        {user?.is_staff || user?.is_superuser ? 'Bienvenido, admin' : 'Bienvenido, usuario'}
      </Typography>
      <Typography color="text.secondary">Selecciona una opción para comenzar.</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {!(user?.is_staff || user?.is_superuser) ? (
          <>
            <Card>
              <CardContent>
                <Typography variant="h6">Cotizar vuelo</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Crea una nueva solicitud de vuelo.</Typography>
                <Button component={Link} to="/new" variant="contained">Ir a Cotizar</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6">Mis solicitudes</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Consulta el estado de tus solicitudes.</Typography>
                <Button component={Link} to="/requests" variant="contained">Ver Mis solicitudes</Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent>
                <Typography variant="h6">Gestión de reservas</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Revisa pendientes y marca como Reservada.</Typography>
                <Button component={Link} to="/operator" variant="contained">Abrir gestión</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6">Destinos</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Consulta/gestiona los destinos (demo visual).</Typography>
                <Button component={Link} to="/destinations" variant="contained">Abrir destinos</Button>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Box>
  );
}
