import { useEffect, useMemo, useState } from "react";
import { listDestinations, type Destination } from "../destinations/api";
import { createRequest, getAvailabilityDates } from "./api";

function pad(n: number) { return n.toString().padStart(2, "0"); }
function daysInMonth(year: number, month: number) { return new Date(year, month, 0).getDate(); }

function MonthGrid({
  ym, available, value, onChange, label,
}: {
  ym: string;
  available: Set<string>;
  value: string | null;
  onChange: (d: string) => void;
  label: string;
}) {
  const [year, month] = ym.split("-").map(Number);
  const total = daysInMonth(year, month);
  const first = new Date(year, month - 1, 1).getDay();
  const cells: Array<{ day: number | null; dateStr: string | null; enabled: boolean }> = [];
  for (let i = 0; i < first; i++) cells.push({ day: null, dateStr: null, enabled: false });
  for (let d = 1; d <= total; d++) {
    const ds = `${year}-${pad(month)}-${pad(d)}`;
    cells.push({ day: d, dateStr: ds, enabled: available.has(ds) });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, dateStr: null, enabled: false });

  return (
    <div>
      <div className="font-medium mb-2">{label} ({ym})</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-600 mb-1">
        {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(h => <div key={h}>{h}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c.day) return <div key={i} className="h-9 border rounded bg-gray-50" />;
          const selected = value === c.dateStr;
          const cls = [
            "h-9 flex items-center justify-center rounded border",
            c.enabled ? "cursor-pointer hover:bg-gray-100" : "opacity-30 bg-gray-50",
            selected ? "ring-2 ring-blue-600 border-blue-600" : ""
          ].join(" ");
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={!c.enabled}
              onClick={() => c.dateStr && onChange(c.dateStr)}
              aria-pressed={selected}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function NewRequestPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [originId, setOriginId] = useState<number | null>(null);
  const [destId, setDestId] = useState<number | null>(null);

  const originIata = useMemo(() => destinations.find(d => d.id === originId)?.iata_code || "", [destinations, originId]);
  const destIata = useMemo(() => destinations.find(d => d.id === destId)?.iata_code || "", [destinations, destId]);

  const [ym, setYm] = useState("2025-09"); // seed de demo

  const [goAvail, setGoAvail] = useState<Set<string>>(new Set());
  const [backAvail, setBackAvail] = useState<Set<string>>(new Set());
  const [goDate, setGoDate] = useState<string | null>(null);
  const [backDate, setBackDate] = useState<string | null>(null);

  const [msg, setMsg] = useState<string | null>(null);
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!originId || !destId) return setMsg("Selecciona origen y destino.");
    if (!goDate) return setMsg("Selecciona fecha de ida disponible.");
    if (backDate && !backAvail.has(backDate)) return setMsg("Fecha de regreso sin disponibilidad.");
    setL(true);
    try {
      await createRequest({
        origin_id: originId,
        destination_id: destId,
        travel_date: goDate,
        return_date: backDate || null,
      });
      setMsg("Solicitud creada ✅");
      setGoDate(null); setBackDate(null);
    } catch (err: any) {
      setMsg(err.message || "Error");
    } finally {
      setL(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Nueva Solicitud</h1>

      <form onSubmit={onSubmit} className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Origen</label>
            <select className="border p-2 w-full" value={originId ?? ""} onChange={e=>setOriginId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">—</option>
              {destinations.map(d => <option key={d.id} value={d.id}>{d.name} ({d.iata_code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Destino</label>
            <select className="border p-2 w-full" value={destId ?? ""} onChange={e=>setDestId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">—</option>
              {destinations.filter(d => d.id !== originId).map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.iata_code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Mes</label>
            <input type="month" className="border p-2 w-full" value={ym} onChange={e=>setYm(e.target.value)} min="2025-09" max="2025-09" />
            <p className="text-xs text-gray-500 mt-1">Demo: septiembre 2025</p>
          </div>
        </div>

        {originIata && destIata ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MonthGrid ym={ym} available={goAvail} value={goDate} onChange={setGoDate} label="Fecha de ida" />
            <MonthGrid ym={ym} available={backAvail} value={backDate} onChange={setBackDate} label="Fecha de regreso (opcional)" />
          </div>
        ) : (
          <p className="text-sm text-gray-600">Selecciona origen y destino para ver la disponibilidad.</p>
        )}

        {msg && <p className="text-sm">{msg}</p>}

        <button className="bg-black text-white px-3 py-2 rounded" disabled={loading || !goDate || !originId || !destId}>
          {loading ? "Creando..." : "Crear solicitud"}
        </button>
      </form>
    </div>
  );
}
