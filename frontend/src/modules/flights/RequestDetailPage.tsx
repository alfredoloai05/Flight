import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { FlightRequest } from "./api";
import { getRequest } from "./api";
import { Box, Typography, Chip, Card, CardContent } from "@mui/material";

export default function RequestDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<FlightRequest | null>(null);
  const [error, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getRequest(Number(id)).then(setItem).catch(e=>setErr(String(e)));
  }, [id]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!item) return <Typography>Cargando...</Typography>;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6">Solicitud #{item.id}</Typography>
          <Chip label={item.status} color={item.status === 'RESERVED' ? 'success' : 'warning'} size="small" />
        </Box>
        <Typography fontWeight={600}>{item.origin.iata_code} → {item.destination.iata_code}</Typography>
        <Typography variant="body2">Ida: {item.travel_date}{item.return_date ? ` · Regreso: ${item.return_date}` : ''}</Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Dueño: {item.owner.first_name ? `${item.owner.first_name} ${item.owner.last_name}` : item.owner.username} · {item.owner.email}
        </Typography>
        <Typography variant="caption" color="text.secondary">Creado: {new Date(item.created_at).toLocaleString()}</Typography>
      </CardContent>
    </Card>
  );
}
