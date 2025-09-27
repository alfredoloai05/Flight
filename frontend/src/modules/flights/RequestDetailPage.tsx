import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { FlightRequest } from "./api";
import { getRequest } from "./api";

export default function RequestDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<FlightRequest | null>(null);
  const [error, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getRequest(Number(id)).then(setItem).catch(e=>setErr(String(e)));
  }, [id]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!item) return <div className="p-6">Cargando...</div>;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Solicitud #{item.id}</h1>
      <div className="text-sm">Estado: {item.status}</div>
      <div className="font-medium">
        {item.origin.iata_code} → {item.destination.iata_code} · {item.travel_date}
        {item.return_date ? ` · regreso ${item.return_date}` : ""}
      </div>
      <div className="text-sm text-gray-600">Dueño: {item.owner.username} · {item.owner.email}</div>
      <div className="text-xs text-gray-500">Creado: {new Date(item.created_at).toLocaleString()}</div>
    </div>
  );
}
