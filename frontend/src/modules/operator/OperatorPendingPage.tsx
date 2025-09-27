import { useEffect, useState } from 'react';
import type { FlightRequest } from '../flights/api';
import { listRequests, reserveRequest } from '../flights/api';
import { useAuth } from '../auth/AuthProvider';
import { Box, Typography, Card, CardContent, Chip, Button, Stack } from '@mui/material';

export default function OperatorPendingPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<FlightRequest[]>([]);
  const [loading, setL] = useState(false);

  async function load() {
    setL(true);
    try {
      setItems(await listRequests('PENDING'));
    } finally {
      setL(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function reserve(id: number) {
    await reserveRequest(id);
    await load();
  }

  if (!user || !(user.is_staff || user.is_superuser)) return <Typography>No autorizado.</Typography>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>Operador · Pendientes</Typography>
      {loading ? <Typography>Cargando...</Typography> : (
        <Stack spacing={2}>
          {items.map(r => (
            <Card key={r.id} variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">#{r.id} · {r.owner.username}</Typography>
                  <Typography fontWeight={600}>{r.origin.iata_code} → {r.destination.iata_code}</Typography>
                  <Typography variant="body2">Ida: {r.travel_date}{r.return_date ? ` · Regreso: ${r.return_date}` : ''}</Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip size="small" label={r.status} color="warning" />
                  <Button variant="contained" color="success" size="large" onClick={() => reserve(r.id)}>Marcar reservada</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && <Typography variant="body2" color="text.secondary">No hay pendientes.</Typography>}
        </Stack>
      )}
    </Box>
  );
}
