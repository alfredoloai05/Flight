import { useAdminDestinos, useUpsertDestino, useEliminarDestino } from '../destinations/api';
import { Box, Typography, Paper, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, IconButton } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

type Form = { id?: number; name: string; iata_code?: string; is_active: boolean };

export default function DestinationsCrudPage() {
  const { hasRole } = useAuth();
  const { data } = useAdminDestinos();
  const upsert = useUpsertDestino();
  const del = useEliminarDestino();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>({ name: '', iata_code: '', is_active: true });

  if (!hasRole('admin')) return <Typography>No autorizado.</Typography>;

  const save = () => {
    upsert.mutate(form, { onSuccess: () => { setOpen(false); setForm({ name: '', iata_code: '', is_active: true }); } });
  };

  const remove = (id: number) => { if (confirm('¿Eliminar destino?')) del.mutate(id); };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Destinos</Typography>
        <Button onClick={() => { setForm({ name: '', iata_code: '', is_active: true }); setOpen(true); }}>Nuevo</Button>
      </Stack>

      <Stack spacing={2}>
        {(data ?? []).map((d) => (
          <Paper key={d.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Typography fontWeight={600}>{d.name}</Typography>
              <Typography variant="body2">IATA: {d.iata_code || '—'} • {d.is_active ? 'Activo' : 'Inactivo'}</Typography>
            </div>
            <Stack direction="row" spacing={1}>
              <IconButton onClick={() => { setForm({ id: d.id, name: d.name, iata_code: d.iata_code ?? '', is_active: d.is_active }); setOpen(true); }}><EditIcon /></IconButton>
              <IconButton onClick={() => remove(d.id)} color="error"><DeleteIcon /></IconButton>
            </Stack>
          </Paper>
        ))}
        {(data?.length ?? 0) === 0 && <Typography variant="body2">Sin destinos.</Typography>}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Editar destino' : 'Nuevo destino'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField label="Nombre" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField label="Código IATA (opcional)" value={form.iata_code} onChange={(e) => setForm((f) => ({ ...f, iata_code: e.target.value.toUpperCase().slice(0,3) }))} />
            <FormControlLabel control={<Switch checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />} label="Activo" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancelar</Button>
          <Button onClick={save} disabled={upsert.isPending}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
