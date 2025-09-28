import { useEffect, useMemo, useState } from "react";
import { listDestinations, type Destination } from "../destinations/api";
import { createRequest, getAvailabilityDates } from "./api";
import {
  Box,
  Typography,
  Alert,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Stack,
  Snackbar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

function ymToBounds(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const start = dayjs(`${y}-${String(m).padStart(2, "0")}-01`);
  const end = start.endOf("month");
  return { start, end };
}

export default function NewRequestPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [originId, setOriginId] = useState<number | "" | null>(null);
  const [destId, setDestId] = useState<number | "" | null>(null);

  const originIata = useMemo(() => destinations.find(d => d.id === originId)?.iata_code || "", [destinations, originId]);
  const destIata = useMemo(() => destinations.find(d => d.id === destId)?.iata_code || "", [destinations, destId]);

  const [ym, setYm] = useState("2025-10");

  const [goAvail, setGoAvail] = useState<Set<string>>(new Set());
  const [backAvail, setBackAvail] = useState<Set<string>>(new Set());
  const [goDate, setGoDate] = useState<Dayjs | null>(null);
  const [backDate, setBackDate] = useState<Dayjs | null>(null);
  const [oneWay, setOneWay] = useState(true);

  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setL] = useState(false);

  useEffect(() => {
    listDestinations().then(setDestinations).catch(console.error);
  }, []);

  useEffect(() => {
    (async () => {
      setGoAvail(new Set()); setBackAvail(new Set());
      setGoDate(null); setBackDate(null);
      if (!originIata || !destIata) return;
      const go = await getAvailabilityDates(originIata, destIata, ym);
      const back = await getAvailabilityDates(destIata, originIata, ym);
      setGoAvail(new Set(go.dates));
      setBackAvail(new Set(back.dates));
    })().catch(console.error);
  }, [originIata, destIata, ym]);

  function isEnabled(avail: Set<string>, d: Dayjs | null, mode: 'go' | 'back') {
    if (!d) return false;
    const ds = d.format("YYYY-MM-DD");
    if (!avail.has(ds)) return false;
    const today = dayjs().startOf('day');
    if (mode === 'go') {
      return d.isAfter(today, 'day');
    }
    // back: debe ser posterior a la ida (si existe)
    if (goDate) return d.isAfter(goDate, 'day');
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setOk(null);
  if (!originId || !destId) return setMsg("Selecciona origen y destino.");
  if (!goDate || !isEnabled(goAvail, goDate, 'go')) return setMsg("Selecciona una fecha de ida disponible.");
  if (!oneWay && backDate && !isEnabled(backAvail, backDate, 'back')) return setMsg("La fecha de regreso no tiene disponibilidad.");
    setL(true);
    try {
      await createRequest({
        origin_id: Number(originId),
        destination_id: Number(destId),
        travel_date: goDate.format("YYYY-MM-DD"),
        return_date: !oneWay && backDate ? backDate.format("YYYY-MM-DD") : null,
      });
      setOk("Solicitud creada");
      setGoDate(null); setBackDate(null);
      setOneWay(true);
    } catch (err: any) {
      setMsg(err.message || "Error");
    } finally {
      setL(false);
    }
  }

  const bounds = ymToBounds(ym);

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Typography variant="h5" fontWeight={600} gutterBottom>Nueva Solicitud</Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 2,
      }}>
          <FormControl fullWidth size="small">
            <InputLabel id="o-l">Origen</InputLabel>
            <Select labelId="o-l" label="Origen" value={originId ?? ""} onChange={(e)=>setOriginId(e.target.value as any)}>
              <MenuItem value=""><em>—</em></MenuItem>
              {destinations.map(d => <MenuItem key={d.id} value={d.id}>{d.name} ({d.iata_code})</MenuItem>)}
            </Select>
          </FormControl>
        <Box>
          <FormControl fullWidth size="small">
            <InputLabel id="d-l">Destino</InputLabel>
            <Select labelId="d-l" label="Destino" value={destId ?? ""} onChange={(e)=>setDestId(e.target.value as any)}>
              <MenuItem value=""><em>—</em></MenuItem>
              {destinations.filter(d => d.id !== originId).map(d => (
                <MenuItem key={d.id} value={d.id}>{d.name} ({d.iata_code})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <TextField type="month" label="Mes" value={ym} onChange={(e)=>setYm(e.target.value)} inputProps={{ min: "2025-10", max: "2025-10" }} helperText="Demo: octubre 2025" size="small" />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        {originIata && destIata ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>Fecha de ida</Typography>
              {goAvail.size === 0 ? (
                <Alert severity="warning">La aerolínea no tiene vuelos disponibles entre estos destinos para el mes seleccionado.</Alert>
              ) : (
              <DateCalendar
                value={goDate}
                onChange={(d)=>setGoDate(d)}
                views={["day"]}
                minDate={bounds.start}
                maxDate={bounds.end}
                slots={{ day: (p) => {
                  const d = p.day;
                  const enabled = isEnabled(goAvail, d, 'go');
                  return <PickersDay {...p} disabled={!enabled} />;
                } }}
              />)}
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1">Fecha de regreso</Typography>
                <FormControlLabel control={<Switch checked={oneWay} onChange={e=>{ setOneWay(e.target.checked); if (e.target.checked) setBackDate(null); }} />} label="Sólo ida" />
              </Stack>
              {oneWay ? (
                <Alert severity="info">Sólo ida activado.</Alert>
              ) : backAvail.size === 0 ? (
                <Alert severity="warning">No hay disponibilidad para el regreso en el mes seleccionado.</Alert>
              ) : (
              <DateCalendar
                value={backDate}
                onChange={(d)=>setBackDate(d)}
                views={["day"]}
                minDate={bounds.start}
                maxDate={bounds.end}
                slots={{ day: (p) => {
                  const d = p.day;
                  const enabled = !oneWay && isEnabled(backAvail, d, 'back');
                  return <PickersDay {...p} disabled={!enabled} />;
                } }}
              />)}
            </Box>
          </Box>
        ) : (
          <Alert severity="info">Selecciona origen y destino para ver la disponibilidad.</Alert>
        )}
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button type="submit" variant="contained" disabled={loading || !goDate || !originId || !destId}>
          {loading ? "Creando..." : "Crear solicitud"}
        </Button>
      </Stack>

      {msg && <Alert severity="error" sx={{ mt: 2 }}>{msg}</Alert>}
      <Snackbar open={!!ok} onClose={()=>setOk(null)} autoHideDuration={2500} message={ok || ""} />
    </Box>
  );
}
