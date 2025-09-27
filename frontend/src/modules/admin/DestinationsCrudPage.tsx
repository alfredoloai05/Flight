import { Box, Typography, Paper, Stack } from '@mui/material';
import { listDestinations, type Destination } from '../destinations/api';
import { useEffect, useState } from 'react';

export default function DestinationsCrudPage() {
  const [items, setItems] = useState<Destination[]>([]);
  useEffect(() => { listDestinations().then(setItems).catch(console.error); }, []);
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Destinos (solo lectura en demo)</Typography>
      <Stack spacing={2}>
        {items.map((d) => (
          <Paper key={d.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Typography fontWeight={600}>{d.name}</Typography>
              <Typography variant="body2">IATA: {d.iata_code || '—'}</Typography>
            </div>
          </Paper>
        ))}
        {items.length === 0 && <Typography variant="body2">Sin destinos.</Typography>}
      </Stack>
    </Box>
  );
}
