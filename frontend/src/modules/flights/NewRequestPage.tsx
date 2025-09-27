import { useState } from 'react';
import { useDestinosActivos } from '../destinations/api';
import { useCrearSolicitud } from './api';
import { Box, Paper, Typography, Stack, TextField, MenuItem, Button } from '@mui/material';

export default function NewRequestPage() {
  const { data: destinos, isLoading } = useDestinosActivos();
  const crear = useCrearSolicitud();
  const [form, setForm] = useState<{ origin_id: number; destination_id: number; travel_date: string }>(
    { origin_id: 0, destination_id: 0, travel_date: '' }
  );
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.origin_id) return setError('Selecciona un origen');
    if (!form.destination_id) return setError('Selecciona un destino');
    if (form.origin_id === form.destination_id) return setError('El origen y destino deben ser distintos');
    if (!form.travel_date) return setError('Selecciona una fecha');
    try {
      await crear.mutateAsync(form);
      window.location.href = '/flights/mine';
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al crear la solicitud');
    }
  };

  return (
    <Box maxWidth={600}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Nueva solicitud de vuelo</Typography>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              select
              label="Origen"
              value={form.origin_id}
              onChange={(e) => setForm(f => ({ ...f, origin_id: Number(e.target.value) }))}
              disabled={isLoading}
            >
              <MenuItem value={0} disabled>Selecciona un origen…</MenuItem>
              {(destinos ?? []).map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}{d.iata_code ? ` (${d.iata_code})` : ''}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Destino"
              value={form.destination_id}
              onChange={(e) => setForm(f => ({ ...f, destination_id: Number(e.target.value) }))}
              disabled={isLoading}
            >
              <MenuItem value={0} disabled>Selecciona un destino…</MenuItem>
              {(destinos ?? []).map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}{d.iata_code ? ` (${d.iata_code})` : ''}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Fecha de viaje (YYYY-MM-DD)"
              placeholder="2025-10-10"
              value={form.travel_date}
              onChange={(e) => setForm(f => ({ ...f, travel_date: e.target.value }))}
            />

            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" disabled={crear.isPending}>Guardar</Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
