import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCandidatos, useAsignarRol } from './use-superadmin';
import { useUser } from '@entities/model-user';
import { CheckCircle2, UserCog, Search, AlertCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { toast } from 'sonner';

interface SuperadminPanelProps {
  targetRole: 'director_ugel' | 'jefe_gestion';
}

export const SuperadminPanel = ({ targetRole }: SuperadminPanelProps) => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const { data: candidatos, isLoading, isError } = useGetCandidatos();
  const asignarRolMutation = useAsignarRol();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'superusuario') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'superusuario') return null;

  const filteredCandidatos = candidatos?.filter((c) => 
    c.dni.includes(searchTerm) || 
    c.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAssignRole = (candidatoId: string, roleCode: 'director_ugel' | 'jefe_gestion') => {
    asignarRolMutation.mutate({ usuarioId: candidatoId, roleCode }, {
      onSuccess: (res) => {
        toast.success(res.message || 'Rol asignado exitosamente');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Ocurrió un error al asignar el rol');
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {targetRole === 'director_ugel' ? 'Designar Director UGEL' : 'Designar Jefe de Gestión'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Asignación y gestión del cargo de {targetRole === 'director_ugel' ? 'Director de la UGEL' : 'Jefe de Gestión Pedagógica'}.
        </p>
      </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <UserCog className="h-5 w-5 text-indigo-500" />
              Directorio de Personal
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/especialistas')} className="h-8">
              Registrar Nuevo
            </Button>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por DNI, nombres..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
          <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Atención:</strong> Esta interfaz es de uso exclusivo para asignar al {targetRole === 'director_ugel' ? 'Director de la UGEL' : 'Jefe de Gestión Pedagógica'}. Al asignar este cargo a una nueva persona, el funcionario anterior regresará automáticamente a su rol de Especialista base.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
            Cargando candidatos...
          </div>
        ) : isError ? (
          <div className="text-center py-10 text-red-500">
            Error al cargar los candidatos. Verifique su conexión.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-medium">DNI</th>
                  <th className="px-4 py-3 font-medium">Nombres Completos</th>
                  <th className="px-4 py-3 font-medium">Rol Actual</th>
                  <th className="px-4 py-3 font-medium text-right">Asignar Cargo</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidatos.map((candidato) => (
                  <tr key={candidato.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">{candidato.dni}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{candidato.nombres} {candidato.apellidos}</div>
                      <div className="text-xs text-slate-500">{candidato.correo || 'Sin correo'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        candidato.rolCodigo === 'director_ugel' ? 'bg-amber-100 text-amber-800' :
                        candidato.rolCodigo === 'jefe_gestion' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {candidato.rolActual}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        size="sm" 
                        variant={candidato.rolCodigo === targetRole ? "default" : "outline"}
                        className={candidato.rolCodigo === targetRole ? (targetRole === 'jefe_gestion' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white") : ""}
                        disabled={
                          asignarRolMutation.isPending || 
                          candidato.rolCodigo === targetRole || 
                          (targetRole === 'director_ugel' && candidato.rolCodigo === 'jefe_gestion') ||
                          (targetRole === 'jefe_gestion' && candidato.rolCodigo === 'director_ugel')
                        }
                        onClick={() => handleAssignRole(candidato.id, targetRole)}
                      >
                        {candidato.rolCodigo === targetRole && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                        {targetRole === 'director_ugel' ? 'Designar Director' : 'Designar Jefe'}
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {filteredCandidatos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                      No se encontraron personas con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
  );
};
