import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCandidatos, useAsignarRol } from './use-superadmin';
import { useUser } from '@entities/model-user';
import { CheckCircle2, UserCog, Search, AlertCircle, BadgeCheck, Users, Briefcase } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { toast } from 'sonner';
import { PageHeader } from '@shared/ui/pageHeader';
import { Spinner } from '@shared/ui/Spinner';
import { Badge } from '@shared/ui/badge';
import { EntityStats } from '@shared/ui/EntityStats';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@shared/ui/table';

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
      onError: (err) => {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || 'Ocurrió un error al asignar el rol');
      }
    });
  };

  // Selectores para las tarjetas de estadísticas
  const currentAssignee = candidatos?.find((c) => c.rolCodigo === targetRole);
  const otherRole = targetRole === 'director_ugel' ? 'jefe_gestion' : 'director_ugel';
  const otherAssignee = candidatos?.find((c) => c.rolCodigo === otherRole);
  const eligibleCount = candidatos?.filter(
    (c) => c.rolCodigo !== 'director_ugel' && c.rolCodigo !== 'jefe_gestion'
  ).length || 0;

  const statsCards = [
    {
      title: targetRole === 'director_ugel' ? 'Director de UGEL Actual' : 'Jefe de Gestión Actual',
      value: currentAssignee ? `${currentAssignee.nombres} ${currentAssignee.apellidos}` : 'Sin designar',
      icon: <BadgeCheck className={`w-5 h-5 ${currentAssignee ? 'text-emerald-500' : 'text-danger'}`} strokeWidth={2} />,
      trendText: currentAssignee ? currentAssignee.correo || 'Designación activa' : 'Cargo vacante',
      trendType: currentAssignee ? ('success' as const) : ('danger' as const),
    },
    {
      title: 'Especialistas Elegibles',
      value: eligibleCount,
      icon: <Users className="w-5 h-5 text-primary" strokeWidth={2} />,
      trendText: 'Disponibles para designación',
      trendType: 'neutral' as const,
    },
    {
      title: targetRole === 'director_ugel' ? 'Jefe de Gestión Pedagógica' : 'Director de UGEL Lampa',
      value: otherAssignee ? `${otherAssignee.nombres} ${otherAssignee.apellidos}` : 'Sin designar',
      icon: <Briefcase className="w-5 h-5 text-amber-500" strokeWidth={2} />,
      trendText: otherAssignee ? 'Dupla directiva activa' : 'Cargo de contraparte vacante',
      trendType: otherAssignee ? ('warning' as const) : ('neutral' as const),
    },
  ];

  return (
    <div className="flex flex-col w-full gap-6">
      <PageHeader
        title={targetRole === 'director_ugel' ? 'Designar Director UGEL' : 'Designar Jefe de Gestión'}
        description={`Asignación y gestión del cargo de ${
          targetRole === 'director_ugel' ? 'Director de la UGEL' : 'Jefe de Gestión Pedagógica'
        }.`}
      />

      <div className="bg-primary-light p-4 rounded-xl flex items-start gap-3 border border-primary/20 animate-in fade-in-0 duration-300">
        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-primary-dark">
          <strong className="font-bold text-primary">Atención:</strong> Esta interfaz es de uso exclusivo para asignar al{' '}
          {targetRole === 'director_ugel' ? 'Director de la UGEL' : 'Jefe de Gestión Pedagógica'}
          . Al asignar este cargo a una nueva persona, el funcionario anterior regresará automáticamente a su rol de Especialista base.
        </div>
      </div>

      {!isLoading && !isError && candidatos && (
        <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <EntityStats cards={statsCards} columns={3} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text">Directorio de Personal</h2>
            <p className="text-xs text-text-muted font-medium">Seleccione un especialista para asignar el cargo.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {targetRole === 'director_ugel' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/superadmin/director/nuevo')}
              className="h-8 shrink-0 font-semibold cursor-pointer"
            >
              Registrar Nuevo
            </Button>
          )}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input 
              placeholder="Buscar por DNI, nombres..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full h-[40vh] flex flex-col justify-center items-center gap-3">
          <Spinner />
          <span className="text-text-muted text-sm font-medium">Cargando candidatos...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-danger font-medium">
          Error al cargar los candidatos. Verifique su conexión.
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[150px] pl-5 font-semibold text-text">DNI</TableHead>
                <TableHead className="font-semibold text-text">Nombres Completos</TableHead>
                <TableHead className="font-semibold text-text">Correo Electrónico</TableHead>
                <TableHead className="font-semibold text-text">Rol Actual</TableHead>
                <TableHead className="text-right pr-5 font-semibold text-text">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidatos.map((candidato) => {
                const isCurrentRole = candidato.rolCodigo === targetRole;
                const isOtherSpecialRole = 
                  (targetRole === 'director_ugel' && candidato.rolCodigo === 'jefe_gestion') ||
                  (targetRole === 'jefe_gestion' && candidato.rolCodigo === 'director_ugel');

                return (
                  <TableRow key={candidato.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-5 font-semibold text-text">{candidato.dni}</TableCell>
                    <TableCell>
                      <div className="font-bold text-text text-sm">
                        {candidato.nombres} {candidato.apellidos}
                      </div>
                    </TableCell>
                    <TableCell className="text-text-muted text-sm font-medium">
                      {candidato.correo || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[0.65rem] py-0.5 px-2.5 uppercase font-bold border ${
                          candidato.rolCodigo === 'director_ugel'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : candidato.rolCodigo === 'jefe_gestion'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {candidato.rolActual}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <Button 
                        size="sm" 
                        variant={isCurrentRole ? "default" : "outline"}
                        className={`font-semibold cursor-pointer transition-all ${
                          isCurrentRole 
                            ? (targetRole === 'jefe_gestion' 
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none" 
                              : "bg-amber-600 hover:bg-amber-700 text-white border-none") 
                            : "text-primary border-primary/20 hover:bg-primary/5 hover:text-primary-hover"
                        }`}
                        disabled={
                          asignarRolMutation.isPending || 
                          isCurrentRole || 
                          isOtherSpecialRole
                        }
                        onClick={() => handleAssignRole(candidato.id, targetRole)}
                      >
                        {isCurrentRole ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Designado
                          </>
                        ) : (
                          targetRole === 'director_ugel' ? 'Designar Director' : 'Designar Jefe'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {filteredCandidatos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-text-muted">
                    No se encontraron personas con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
