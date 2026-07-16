import { Building2, FileCheck2, FileWarning, BarChart4 } from 'lucide-react';
import { StatCard } from '@shared/ui/Stat-Card';
import { EvaluationStateCard } from './components/EvaluationStateCard';
import { LampaMap } from './components/LampaMap';
import { RecentMonitoringsTable } from './components/RecentMonitoringsTable';

export const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total II.EE."
          icon={<Building2 className="w-5 h-5" />}
          value="503"
        />
        <StatCard
          title="Monitoreadas"
          icon={<FileCheck2 className="w-5 h-5" />}
          value="120"
          trendText="↗ 23.8%"
          trendType="success"
        />
        <StatCard
          title="Pendientes"
          icon={<FileWarning className="w-5 h-5" />}
          value="383"
        />
        <StatCard
          title="Nivel Promedio"
          icon={<BarChart4 className="w-5 h-5" />}
          value="2.8 / 4.0"
          variant="solidDestructive"
        />
      </div>

      {/* Main Content Area: Left (State), Right (Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[450px]">
        {/* Left Panel */}
        <div className="lg:col-span-1">
          <EvaluationStateCard />
        </div>

        {/* Right Panel - Map */}
        <div className="lg:col-span-2">
          <LampaMap />
        </div>
      </div>

      {/* Bottom Table */}
      <div>
        <RecentMonitoringsTable />
      </div>
    </div>
  );
};
