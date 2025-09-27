import { useParams } from 'react-router-dom';
import { useDetalleSolicitud } from './api';
import { Box, Paper, Typography, Chip } from '@mui/material';

export default function RequestDetailPage() {
  const { id } = useParams();
  const reqId = Number(id);
  const { data } = useDetalleSolicitud(reqId);

  if (!data) return <Typography>No encontrado</Typography>;

  return (
    <Box maxWidth={600}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Detalle</Typography>
        <Typography><b>Destino:</b> {data.destination.name}</Typography>
        <Typography><b>Fecha de viaje:</b> {new Date(data.travel_date).toLocaleDateString()}</Typography>
        <Typography><b>Dueño:</b> {data.owner.username} ({data.owner.email})</Typography>
        <Chip sx={{ mt: 1 }} label={data.status === 'RESERVED' ? 'Reservada' : 'Pendiente'} color={data.status === 'RESERVED' ? 'success' : 'default'} />
      </Paper>
    </Box>
  );
}
