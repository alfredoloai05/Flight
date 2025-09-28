import { Box, Typography, Paper, Stack, Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { listDestinations, type Destination } from '../destinations/api';
import { useEffect, useState } from 'react';

type FormState = {
  name: string;
  iata_code: string;
}

export default function DestinationsCrudPage() {
  const [items, setItems] = useState<Destination[]>([]);
  const [openInfo, setOpenInfo] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>({ name: '', iata_code: '' });
  const [snack, setSnack] = useState<{open: boolean; msg: string; severity: 'info'|'success'|'warning'|'error'}>({ open: false, msg: '', severity: 'info' });

  useEffect(() => { listDestinations().then(setItems).catch(console.error); }, []);

  function demoNotice(message?: string) {
    setOpenInfo(true);
    if (message) setSnack({ open: true, msg: message, severity: 'info' });
  }

  function onNew() {
  setForm({ name: '', iata_code: '' });
    setOpenForm(true);
  }

  function onEdit(d: Destination) {
  setForm({ name: d.name, iata_code: d.iata_code || '' });
    setOpenForm(true);
  }

  function onDelete(_d: Destination) {
    demoNotice('En el demo no se eliminan destinos.');
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpenForm(false);
    demoNotice('En el demo los destinos y la disponibilidad se cargan automáticamente al iniciar. No se guardaron cambios.');
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Destinos</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={onNew}>Nuevo destino</Button>
      </Box>

      <Stack spacing={2}>
        {items.map((d) => (
          <Paper key={d.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Typography fontWeight={600}>{d.name}</Typography>
              <Typography variant="body2">IATA: {d.iata_code || '—'}</Typography>
            </div>
            <Box>
              <Tooltip title="Editar"><IconButton onClick={()=>onEdit(d)}><EditIcon /></IconButton></Tooltip>
              <Tooltip title="Eliminar"><IconButton color="error" onClick={()=>onDelete(d)}><DeleteIcon /></IconButton></Tooltip>
            </Box>
          </Paper>
        ))}
        {items.length === 0 && <Typography variant="body2">Sin destinos.</Typography>}
      </Stack>

      {/* Modal informativo de demo */}
      <Dialog open={openInfo} onClose={()=>setOpenInfo(false)}>
        <DialogTitle>Información del demo</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            En esta demo, los Destinos y la Disponibilidad entre ciudades se cargan automáticamente al iniciar
            el sistema (comando bootstrap). Por eso, las acciones de guardar/editar/eliminar no modifican datos reales.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenInfo(false)}>Entendido</Button>
        </DialogActions>
      </Dialog>

      {/* Formulario de Nuevo/Editar (sin persistencia) */}
      <Dialog open={openForm} onClose={()=>setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Destino</DialogTitle>
        <Box component="form" onSubmit={onSubmit}>
          <DialogContent sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Nombre" required value={form.name} onChange={e=>setForm(s=>({ ...s, name: e.target.value }))} />
            <TextField label="Código IATA" inputProps={{ maxLength: 3 }} value={form.iata_code} onChange={e=>setForm(s=>({ ...s, iata_code: e.target.value.toUpperCase() }))} />
            {/* En el demo omitimos el estado activo/inactivo */}
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpenForm(false)} color="inherit">Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={()=>setSnack(s=>({ ...s, open: false }))}>
        <Alert severity={snack.severity} variant="filled" onClose={()=>setSnack(s=>({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
