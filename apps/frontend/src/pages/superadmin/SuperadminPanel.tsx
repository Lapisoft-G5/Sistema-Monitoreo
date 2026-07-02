import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCandidatos, useAsignarRol } from './use-superadmin';
import { useUser } from '@entities/model-user';
import { Shield, LogOut, CheckCircle2, UserCog, Search, AlertCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { toast } from 'sonner';

export const SuperadminPanel = () => {
  const { user, isAuthenticated, logout } = useUser();
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <header className="w-full max-w-5xl px-6 py-6 flex justify-between items-center mt-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Superadmin Panel</h1>
            <p className="text-sm text-slate-500">Gestión de Altos Cargos UGEL</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">{user?.nombres} {user?.apellidos}</p>
            <p className="text-xs text-slate-500">DNI: {user?.dni}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="w-full max-w-5xl px-6 py-8 mt-4 bg-white rounded-xl shadow-sm border border-slate-100 mb-10 flex-1">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-indigo-500" />
            Directorio de Personal
          </h2>
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

        <div className="bg-slate-50 p-4 rounded-lg mb-6 flex items-start gap-3 border border-blue-100">
          <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Atención:</strong> Esta interfaz es de uso exclusivo para asignar al Director de la UGEL y al Jefe de Gestión Pedagógica. Seleccione a la persona en la lista y haga clic en el cargo correspondiente.
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
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant={candidato.rolCodigo === 'jefe_gestion' ? "default" : "outline"}
                        className={candidato.rolCodigo === 'jefe_gestion' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                        disabled={asignarRolMutation.isPending || candidato.rolCodigo === 'jefe_gestion'}
                        onClick={() => handleAssignRole(candidato.id, 'jefe_gestion')}
                      >
                        {candidato.rolCodigo === 'jefe_gestion' && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                        Jefe de Gestión
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant={candidato.rolCodigo === 'director_ugel' ? "default" : "outline"}
                        className={candidato.rolCodigo === 'director_ugel' ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
                        disabled={asignarRolMutation.isPending || candidato.rolCodigo === 'director_ugel'}
                        onClick={() => handleAssignRole(candidato.id, 'director_ugel')}
                      >
                        {candidato.rolCodigo === 'director_ugel' && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                        Director UGEL
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
      </main>
    </div>
  );
};
