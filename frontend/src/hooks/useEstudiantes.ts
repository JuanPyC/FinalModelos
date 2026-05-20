import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { ApiResponse, Estudiante } from '../types';

export const useGetEstudiantes = () => {
  return useQuery({
    queryKey: ['estudiantes'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Estudiante[]>>('/estudiantes');
      return data.data;
    },
  });
};

export const useGetEstudiante = (id: number) => {
  return useQuery({
    queryKey: ['estudiantes', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Estudiante>>(`/estudiantes/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateEstudiante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nuevoEstudiante: Partial<Estudiante>) => {
      const { data } = await apiClient.post<ApiResponse<Estudiante>>('/estudiantes', nuevoEstudiante);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
};

export const useUpdateEstudiante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Estudiante> }) => {
      const response = await apiClient.patch<ApiResponse<Estudiante>>(`/estudiantes/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
};

export const useDeleteEstudiante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/estudiantes/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
};
