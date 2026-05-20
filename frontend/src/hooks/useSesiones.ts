import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { ApiResponse, Sesion, Inscripcion } from '../types';

export const useGetSesiones = () => {
  return useQuery({
    queryKey: ['sesiones'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Sesion[]>>('/sesiones');
      return data.data;
    },
  });
};

export const useCreateSesion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nuevaSesion: Partial<Sesion>) => {
      const { data } = await apiClient.post<ApiResponse<Sesion>>('/sesiones', nuevaSesion);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesiones'] });
    },
  });
};

export const useUpdateAsistencia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: string }) => {
      const { data } = await apiClient.patch<ApiResponse<Inscripcion>>(`/inscripciones/${id}/asistencia`, {
        estado_asistencia: estado,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesiones'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
};

export const useInscribirEstudiante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inscripcion: { estudiante_id: number; sesion_id: number }) => {
      const { data } = await apiClient.post<ApiResponse<Inscripcion>>('/inscripciones', inscripcion);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesiones'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
};
