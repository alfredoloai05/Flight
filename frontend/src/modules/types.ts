export type Destination = {
  id: number;
  name: string;
  iata_code?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FlightRequestStatus = 'PENDING' | 'RESERVED';

export type FlightRequest = {
  id: number;
  owner: { id: number; username: string; email: string };
  destination: Destination;
  travel_date: string;
  status: FlightRequestStatus;
  created_at: string;
  updated_at: string;
};