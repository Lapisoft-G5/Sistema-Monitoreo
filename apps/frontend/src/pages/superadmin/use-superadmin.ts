import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminApi } from './superadmin.api';

export const useGetCandidatos = () => {
  return useQuery({
    queryKey: ['superadmin', 'candidatos'],
    queryFn: superadminApi.getCandidatos,
  });
};

export const useAsignarRol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ usuarioId, roleCode }: { usuarioId: string; roleCode: string }) => 
      superadminApi.asignarRol(usuarioId, roleCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'candidatos'] });
    },
  });
};
