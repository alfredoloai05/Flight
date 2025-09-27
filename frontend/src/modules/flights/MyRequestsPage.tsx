import { useEffect, useState } from "react";
import type { FlightRequest } from "./api";
import { listRequests } from "./api";

export default function MyRequestsPage() {
  const [items, setItems] = useState<FlightRequest[]>([]);
  const [filter, setFilter] = useState<"ALL"|"PENDING"|"RESERVED">("ALL");

  useEffect(() => {
    const status = filter === "ALL" ? undefined : filter;
    listRequests(status).then(setItems).catch(console.error);
  }, [filter]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Mis Solicitudes</h1>
      <div className="mb-3">
        <select className="border p-2" value={filter} onChange={e=>setFilter(e.target.value as any)}>
          <option value="ALL">Todas</option>
          <option value="PENDING">Pendientes</option>
          <option value="RESERVED">Reservadas</option>
        </select>
      </div>
      <div className="space-y-2">
        {items.map(r => (
          <div key={r.id} className="border rounded p-3">
            <div className="text-sm text-gray-600">#{r.id} · {r.status}</div>
            <div className="font-medium">
              {r.origin.iata_code} → {r.destination.iata_code} · {r.travel_date}
              {r.return_date ? ` · regreso ${r.return_date}` : ""}
            </div>
            <div className="text-xs text-gray-500">Creado: {new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-600">Sin resultados.</p>}
      </div>
    </div>
  );
}

