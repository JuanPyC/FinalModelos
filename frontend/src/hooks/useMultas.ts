import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { ApiResponse, Multa } from '../types';

export const useGetMultas = () => {
  return useQuery({
    queryKey: ['multas'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Multa[]>>('/multas');
      return data.data;
    },
  });
};

export const useGetMultasPendientes = () => {
  return useQuery({
    queryKey: ['multas', 'pendientes'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Multa[]>>('/multas/pendientes');
      return data.data;
    },
  });
};

export const usePayMulta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.patch<ApiResponse<Multa>>(`/multas/${id}/pagar`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multas'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
};
