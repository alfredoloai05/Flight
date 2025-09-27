import { usePendientesOperador, useMarcarReservada } from '../flights/api';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';

export default function OperatorPendingPage() {
  const { hasRole } = useAuth();
  const { data } = usePendientesOperador();
  const marcar = useMarcarReservada();

  if (!hasRole('operator')) return <Typography>No autorizado.</Typography>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Solicitudes pendientes</Typography>
      <Stack spacing={2}>
        {(data ?? []).map((r) => (
          <Paper key={r.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Typography fontWeight={600}>{r.destination.name}</Typography>
              <Typography variant="body2">Viaja: {new Date(r.travel_date).toLocaleDateString()}</Typography>
              <Typography variant="body2">Dueño: {r.owner.username} • {r.owner.email}</Typography>
            </div>
            <Button onClick={() => marcar.mutate(r.id)} disabled={marcar.isPending}>Marcar como Reservada</Button>
          </Paper>
        ))}
        {(data?.length ?? 0) === 0 && <Typography variant="body2">No hay pendientes.</Typography>}
      </Stack>
    </Box>
  );
}
