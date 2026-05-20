import { useQuery } from '@tanstack/react-query';
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

export const useGetProfesores = () => {
  return useQuery({
    queryKey: ['profesores'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Profesor[]>>('/profesores');
      return data.data;
    },
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
