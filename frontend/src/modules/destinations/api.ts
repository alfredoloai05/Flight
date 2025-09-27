import { http } from '../api/http';

export type Destination = { id: number; name: string; iata_code: string };

export function listDestinations() {
  return http.get('/destinations/') as Promise<Destination[]>;
}
