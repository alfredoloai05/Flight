import { http } from "../api/http";
import type { Destination } from "../destinations/api";

export type FlightRequest = {
  id: number;
  owner: { id: number; username: string; email: string; first_name?: string; last_name?: string };
  origin: Destination;
  destination: Destination;
  travel_date: string;
  return_date: string | null;
  status: "PENDING" | "RESERVED";
  created_at: string;
  updated_at: string;
};

export function listRequests(status?: "PENDING" | "RESERVED") {
  const q = status ? `?status=${status}` : "";
  return http.get(`/flight-requests/${q}`) as Promise<FlightRequest[]>;
}

export function getRequest(id: number) {
  return http.get(`/flight-requests/${id}/`) as Promise<FlightRequest>;
}

export function createRequest(payload: {
  origin_id: number;
  destination_id: number;
  travel_date: string;
  return_date?: string | null;
}) {
  return http.post(`/flight-requests/`, payload) as Promise<FlightRequest>;
}

export function patchRequestStatus(id: number, status: "PENDING" | "RESERVED") {
  return http.patch(`/flight-requests/${id}/`, { status }) as Promise<FlightRequest>;
}

export function reserveRequest(id: number) {
  return http.post(`/flight-requests/${id}/reserve/`) as Promise<FlightRequest>;
}

// Disponibilidad (YYYY-MM)
export function getAvailabilityDates(originIata: string, destIata: string, ym: string) {
  const q = new URLSearchParams({ origin: originIata, destination: destIata, month: ym });
  return http.get(`/availability/dates/?${q.toString()}`) as Promise<{ dates: string[] }>;
}
