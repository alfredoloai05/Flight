import { useEffect, useState } from 'react';
import type { FlightRequest } from '../flights/api';
import { listRequests, patchRequestStatus } from '../flights/api';
import { useAuth } from '../auth/AuthProvider';

export default function OperatorPendingPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<FlightRequest[]>([]);
  const [loading, setL] = useState(false);

  async function load() {
    setL(true);
    try {
      setItems(await listRequests('PENDING'));
    } finally {
      setL(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function reserve(id: number) {
    await patchRequestStatus(id, 'RESERVED');
    await load();
  }

  if (!user || !(user.is_staff || user.is_superuser)) return <div>No autorizado.</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Operador · Pendientes</h1>
      {loading ? <p>Cargando...</p> : (
        <div className="space-y-2">
          {items.map(r => (
            <div key={r.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">
                  #{r.id} · {r.owner.username} · {r.status}
                </div>
                <div className="font-medium">
                  {r.origin.iata_code} → {r.destination.iata_code} · {r.travel_date}
                  {r.return_date ? ` · regreso ${r.return_date}` : ""}
                </div>
              </div>
              <button onClick={() => reserve(r.id)} className="px-3 py-2 bg-green-600 text-white rounded">
                Marcar reservada
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-600">No hay pendientes.</p>}
        </div>
      )}
    </div>
  );
}
