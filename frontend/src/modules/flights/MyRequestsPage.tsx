import { useEffect, useState } from "react";
import type { FlightRequest } from "./api";
import { listRequests } from "./api";
import { Box, Typography, ToggleButtonGroup, ToggleButton, Card, CardContent, Chip } from "@mui/material";

export default function MyRequestsPage() {
  const [items, setItems] = useState<FlightRequest[]>([]);
  const [filter, setFilter] = useState<"ALL"|"PENDING"|"RESERVED">("ALL");

  useEffect(() => {
    const status = filter === "ALL" ? undefined : filter;
    listRequests(status).then(setItems).catch(console.error);
  }, [filter]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>Mis Solicitudes</Typography>
      <ToggleButtonGroup exclusive size="small" value={filter} onChange={(_, v)=> v && setFilter(v)} sx={{ mb: 2 }}>
        <ToggleButton value="ALL">Todas</ToggleButton>
        <ToggleButton value="PENDING">Pendientes</ToggleButton>
        <ToggleButton value="RESERVED">Reservadas</ToggleButton>
      </ToggleButtonGroup>
      <Box display="grid" gap={2}>
        {items.map(r => (
          <Card key={r.id} variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">#{r.id}</Typography>
                <Chip size="small" label={r.status} color={r.status === 'RESERVED' ? 'success' : 'warning'} />
              </Box>
              <Typography fontWeight={600}>{r.origin.iata_code} → {r.destination.iata_code}</Typography>
              <Typography variant="body2">Ida: {r.travel_date}{r.return_date ? ` · Regreso: ${r.return_date}` : ''}</Typography>
              <Typography variant="caption" color="text.secondary">Creado: {new Date(r.created_at).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <Typography variant="body2" color="text.secondary">Sin resultados.</Typography>}
      </Box>
    </Box>
  );
}

