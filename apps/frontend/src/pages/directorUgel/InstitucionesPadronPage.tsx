import { StatCard } from '@shared/ui/Stat-Card';
import { PadronFilters } from './components/PadronFilters';
import { PadronTable } from './components/PadronTable';
import { DesempenoNivelCard } from './components/DesempenoNivelCard';
import { RankingEspecialidadCard } from './components/RankingEspecialidadCard';
import { SeguimientoCriticoCard } from './components/SeguimientoCriticoCard';
import { CoberturaProvincialCard } from './components/CoberturaProvincialCard';
import { GraduationCap, CheckCircle2, AlertTriangle, Plus, FileSpreadsheet } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchInstituciones } from '@features/institutions/institution-service';
import type { Institucion } from '@entities/model-instituciones';
import { Card } from '@shared/ui/card';

export const InstitucionesPadronPage = () => {
  const [stats, setStats] = useState({ total: 0, monitoreadas: 0, pendientes: 0, porcentaje: 0 });
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, institucionesData] = await Promise.all([
          fetchDashboardStats(),
          fetchInstituciones()
        ]);
        setStats(statsData);
        setInstituciones(institucionesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full p-6 overflow-y-auto bg-background">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text">Semáforo Educativo Provincial</h1>
          <p className="text-sm text-text-muted mt-1">
            Administración del padrón oficial y monitoreo de desempeño de II.EE.
          </p>
        </div>
        <Button className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Institución
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total II.EE."
          icon={<GraduationCap className="w-5 h-5" />}
          value={loading ? '...' : stats.total.toString()}
          trendText="↗ +2 este mes"
          trendType="neutral"
          bottomAccent="primary"
        />
        <StatCard
          title="Monitoreadas"
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          value={loading ? '...' : stats.monitoreadas.toString()}
          progressValue={stats.porcentaje}
          trendText={`${stats.porcentaje}% del total`}
          bottomAccent="success"
        />
        <StatCard
          title="Pendientes"
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
          value={loading ? '...' : stats.pendientes.toString()}
          trendText="! Requieren atención"
          trendType="danger"
          bottomAccent="destructive"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="h-64">
            <DesempenoNivelCard />
          </div>

          <Card className="flex flex-col flex-1 border-border shadow-xs bg-card overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="text-sm font-bold text-text">Padrón de Instituciones</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-text-muted">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                  Excel
                </Button>
              </div>
            </div>
            
            {/* Mantendremos los filtros visibles encima de la tabla por mejor UX */}
            <div className="border-b border-border bg-card">
               <PadronFilters />
            </div>

            <div className="flex-1 p-0 min-h-[400px]">
              {loading ? (
                <div className="p-8 text-center text-text-muted">Cargando instituciones...</div>
              ) : (
                <PadronTable data={instituciones} />
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="h-64">
            <RankingEspecialidadCard />
          </div>
          
          <div className="flex-1">
             <SeguimientoCriticoCard />
          </div>
          
          <div className="h-36">
            <CoberturaProvincialCard />
          </div>
        </div>
      </div>
    </div>
  );
};
