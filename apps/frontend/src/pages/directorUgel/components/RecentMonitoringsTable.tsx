import { useNavigate } from 'react-router-dom';
import { Card } from '@shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Badge } from '@shared/ui/badge';
import { Avatar, AvatarFallback } from '@shared/ui/avatar';
import { ArrowRight } from 'lucide-react';

export interface MonitoringRow {
  id: string | number;
  /** Título principal (IE en vista UGEL, docente en vista Director). */
  school: string;
  /** Subtítulo (código modular). Opcional. */
  codModular?: string;
  level: string;
  district?: string;
  specialist: string;
  specialistInitials: string;
  date: string;
  status: string;
  score: number;
  statusVariant: string;
}

const mockData: MonitoringRow[] = [
  {
    id: 1,
    school: 'IE 70001 Huayta',
    codModular: '0234567',
    level: 'Primaria',
    district: 'LAMPA',
    specialist: 'Juan Pérez',
    specialistInitials: 'JP',
    date: '12/10/2023',
    status: 'Satisfactorio',
    score: 3.5,
    statusVariant: 'success',
  },
  {
    id: 2,
    school: 'IE 71011 Pucará',
    codModular: '0234889',
    level: 'Secundaria',
    district: 'PUCARÁ',
    specialist: 'María Gómez',
    specialistInitials: 'MG',
    date: '11/10/2023',
    status: 'En Proceso',
    score: 2.2,
    statusVariant: 'warning',
  },
  {
    id: 3,
    school: 'IE Inicial 115 Lampa',
    codModular: '0234123',
    level: 'Inicial',
    district: 'LAMPA',
    specialist: 'Carlos Ruiz',
    specialistInitials: 'CR',
    date: '10/10/2023',
    status: 'Crítico',
    score: 1.2,
    statusVariant: 'destructive',
  }
];

interface RecentMonitoringsTableProps {
  rows?: MonitoringRow[];
  /** Etiqueta de la primera columna (IE en UGEL, Docente en Director). */
  firstColumnLabel?: string;
  emptyLabel?: string;
  /** Ruta a la que navega "Ver reporte detallado" (ej. Fichas Completadas). */
  detailPath?: string;
}

export const RecentMonitoringsTable = ({
  rows,
  firstColumnLabel = 'Institución Educativa',
  emptyLabel = 'Sin monitoreos registrados.',
  detailPath,
}: RecentMonitoringsTableProps = {}) => {
  const data = rows ?? mockData;
  const navigate = useNavigate();
  return (
    <Card className="shadow-xs border-border flex flex-col h-full overflow-hidden">
      <div className="p-5 flex justify-between items-center border-b border-border bg-card">
        <h3 className="text-lg font-bold">Monitoreos Recientes</h3>
        {detailPath && (
          <span
            onClick={() => navigate(detailPath)}
            className="text-sm font-semibold text-primary cursor-pointer hover:underline flex items-center gap-1"
          >
            Ver reporte detallado <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold uppercase tracking-wider">{firstColumnLabel}</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Nivel / Distrito</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Especialista Responsable</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Fecha Visita</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-right">Estado Logro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-text-muted py-8">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-bold">{row.school}</div>
                  {row.codModular && (
                    <div className="text-xs text-text-muted">Cód. Modular: {row.codModular}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-text">{row.level}</div>
                  {row.district && (
                    <div className="text-xs text-text-muted uppercase">{row.district}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7 bg-primary/10 text-primary">
                      <AvatarFallback className="text-[10px] font-bold">{row.specialistInitials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-text-muted">{row.specialist}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-text-muted">
                  {row.date}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={row.statusVariant as any} className="uppercase font-bold tracking-wider text-[10px] px-2 py-1">
                    {row.score} - {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
