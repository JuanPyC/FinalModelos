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

export const useUpdateSesion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Sesion> }) => {
      const response = await apiClient.patch<ApiResponse<Sesion>>(`/sesiones/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesiones'] });
    },
  });
};

export const useDeleteSesion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/sesiones/${id}`);
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
      const response = await apiClient.patch<ApiResponse<Inscripcion>>(`/inscripciones/${id}`, {
        estado_asistencia: estado,
      });
      return response.data;
    },
    onSuccess: (response, { estado }) => {
      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar asistencia');
      }
      queryClient.invalidateQueries({ queryKey: ['sesiones'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      queryClient.invalidateQueries({ queryKey: ['multas'] });
      const mensaje = estado === 'FALTO'
        ? 'Inasistencia registrada. Se generó multa automática.'
        : estado === 'ASISTIO'
          ? 'Asistencia registrada correctamente.'
          : `Estado actualizado a ${estado}.`;
      alert(mensaje);
    },
    onError: (error: any) => {
      const backendError = error?.response?.data?.error;
      const message = backendError || error?.message || 'Error al actualizar asistencia';
      alert(`Error: ${message}`);
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
    onError: (error: any) => {
      alert(error?.response?.data?.error || 'Error al inscribir estudiante');
    }
  });
};

export const useDeleteInscripcion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/inscripciones/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesiones'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.error || 'Error al eliminar inscripción');
    }
  });
};
