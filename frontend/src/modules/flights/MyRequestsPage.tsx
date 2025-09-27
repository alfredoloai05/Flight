import { useMisSolicitudes } from './api';
import { Box, Paper, Typography, Chip, Stack, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function MyRequestsPage() {
  const { data } = useMisSolicitudes();
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Mis solicitudes</Typography>
      <Stack spacing={2}>
        {(data ?? []).map((r) => (
          <Paper key={r.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Typography fontWeight={600}>{r.destination.name}</Typography>
              <Typography variant="body2">Fecha de viaje: {new Date(r.travel_date).toLocaleDateString()}</Typography>
            </div>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip label={r.status === 'RESERVED' ? 'Reservada' : 'Pendiente'} color={r.status === 'RESERVED' ? 'success' : 'default'} />
              <Button component={Link} to={`/flights/${r.id}`} variant="outlined">Detalle</Button>
            </Stack>
          </Paper>
        ))}
        {(data?.length ?? 0) === 0 && <Typography variant="body2">Aún no tienes solicitudes.</Typography>}
      </Stack>
    </Box>
  );
}

