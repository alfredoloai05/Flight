
import { http } from "../api/http";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type FlightRequestStatus = "PENDING" | "RESERVED";

export interface FlightRequest {
  id: number;
  owner: { id: number; username: string; email: string };
  origin: { id: number; name: string; iata_code: string };
  destination: { id: number; name: string; iata_code: string };
  travel_date: string;   // YYYY-MM-DD
  return_date?: string | null;
  status: FlightRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateFlightRequestPayload {
  origin_id: number;
  destination_id: number;
  travel_date: string;        // YYYY-MM-DD
  return_date?: string | null;
}

export async function createFlightRequest(payload: CreateFlightRequestPayload) {
  return http.post<FlightRequest>("/api/flight-requests/", payload);
}

export async function listMyRequests(params?: { status?: FlightRequestStatus }) {
  const qs = params?.status ? `?status=${params.status}` : "";
  return http.get<FlightRequest[]>(`/api/flight-requests/${qs}`);
}

export async function listPendingRequests() {
  // para operador/admin
  return http.get<FlightRequest[]>("/api/flight-requests/?status=PENDING");
}

export async function updateRequestStatus(id: number, status: FlightRequestStatus) {
  return http.patch<FlightRequest>(`/api/flight-requests/${id}/`, { status });
}

export async function getFlightRequestDetail(id: number) {
  return http.get<FlightRequest>(`/api/flight-requests/${id}/`);
}

// === Disponibilidad ===

export interface AvailabilityDatesResponse {
  dates: string[]; // ["YYYY-MM-DD", ...]
}

/**
 * Devuelve fechas disponibles para la ruta y mes dados.
 * month: "YYYY-MM"
 */
export async function getAvailabilityDates(params: {
  origin_iata: string;
  destination_iata: string;
  month: string; // YYYY-MM
}) {
  // Ojo: http ya mete baseURL (VITE_API_URL); armamos string directo:
  const qs = `?origin=${params.origin_iata}&destination=${params.destination_iata}&month=${params.month}`;
  return http.get<AvailabilityDatesResponse>("/api/availability/dates/" + qs);
}

// ==========================
// React Query hooks
// ==========================

const qk = {
  mine: (status?: FlightRequestStatus) => ["flightRequests", "mine", status ?? "all"],
  pending: ["flightRequests", "pending"] as const,
  detail: (id: number) => ["flightRequests", "detail", id] as const,
};

export function useMisSolicitudes(params?: { status?: FlightRequestStatus }) {
  return useQuery({
    queryKey: qk.mine(params?.status),
    queryFn: async () => (await listMyRequests(params)).data,
  });
}

export function useDetalleSolicitud(id: number) {
  return useQuery({
    queryKey: qk.detail(id),
    queryFn: async () => (await getFlightRequestDetail(id)).data,
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCrearSolicitud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFlightRequestPayload) => createFlightRequest(payload).then(r => r.data),
    onSuccess: () => {
      // invalidar listas propias
      qc.invalidateQueries({ queryKey: qk.mine(undefined) });
    },
  });
}

export function usePendientesOperador() {
  return useQuery({
    queryKey: qk.pending,
    queryFn: async () => (await listPendingRequests()).data,
  });
}

export function useMarcarReservada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => updateRequestStatus(id, "RESERVED").then(r => r.data),
    onSuccess: (data) => {
      // refrescar pendientes y detalle
      qc.invalidateQueries({ queryKey: qk.pending });
      qc.invalidateQueries({ queryKey: qk.detail(data.id) });
      // también refrescar mis solicitudes para ver el nuevo estado
      qc.invalidateQueries({ queryKey: qk.mine(undefined) });
    },
  });
}
