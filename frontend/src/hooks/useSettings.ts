import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { ApiResponse, Nivel, Profesor, Salon } from '../types';

export const useGetNiveles = () => {
  return useQuery({
    queryKey: ['niveles'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Nivel[]>>('/niveles');
      return data.data;
    },
  });
};

export const useCreateNivel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nuevoNivel: Partial<Nivel>) => {
      const { data } = await apiClient.post<ApiResponse<Nivel>>('/niveles', nuevoNivel);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['niveles'] }),
  });
};

export const useDeleteNivel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/niveles/${id}`);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['niveles'] }),
  });
};

export const useGetProfesores = () => {
  return useQuery({
    queryKey: ['profesores'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Profesor[]>>('/profesores');
      return data.data;
    },
  });
};

export const useCreateProfesor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nuevoProfesor: Partial<Profesor>) => {
      const { data } = await apiClient.post<ApiResponse<Profesor>>('/profesores', nuevoProfesor);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profesores'] }),
  });
};

export const useDeleteProfesor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/profesores/${id}`);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profesores'] }),
  });
};

export const useGetSalones = () => {
  return useQuery({
    queryKey: ['salones'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Salon[]>>('/salones');
      return data.data;
    },
  });
};

export const useCreateSalon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nuevoSalon: Partial<Salon>) => {
      const { data } = await apiClient.post<ApiResponse<Salon>>('/salones', nuevoSalon);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salones'] }),
  });
};

export const useDeleteSalon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/salones/${id}`);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salones'] }),
  });
};
