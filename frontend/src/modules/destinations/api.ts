import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../api/http';
import type { Destination } from '../types';


export function useDestinosActivos() {
  return useQuery({
    queryKey: ['destinos-activos'],
    queryFn: async () => {
      const { data } = await http.get<Destination[]>('/destinations/');
      return data;
    },
  });
}

export function useAdminDestinos() {
  return useQuery({
    queryKey: ['admin-destinos'],
    queryFn: async () => {
      const { data } = await http.get<Destination[]>('/destinations-admin/');
      return data;
    },
  });
}

export function useUpsertDestino() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Destination> & { id?: number }) => {
      if (payload.id) {
        const { data } = await http.put<Destination>(`/destinations-admin/${payload.id}/`, payload);
        return data;
      } else {
        const { data } = await http.post<Destination>('/destinations-admin/', payload);
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-destinos'] });
      qc.invalidateQueries({ queryKey: ['destinos-activos'] });
    },
  });
}

export function useEliminarDestino() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/destinations-admin/${id}/`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-destinos'] });
      qc.invalidateQueries({ queryKey: ['destinos-activos'] });
    },
  });
}
