import type { ReactNode } from 'react';
import { Card } from '@shared/ui/card';

interface StatCardProps {
  title: string;
  icon: ReactNode;
  value: string | number;
  trendText?: string;
  trendType?: 'success' | 'warning' | 'danger' | 'neutral';
  progressValue?: number; // Para la barrita de progreso (0 a 100)
}

export const StatCard = ({ title, icon, value, trendText, trendType = 'neutral', progressValue }: StatCardProps) => {
  const trendColors = {
    success: 'text-green-600 bg-green-500/10',
    warning: 'text-amber-600 bg-amber-500/10',
    danger: 'text-destructive bg-destructive/10',
    neutral: 'text-text-muted bg-muted',
  };

  return (
    <Card className="p-5 border border-border shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            {title}
          </span>
          <div className="text-text-muted">{icon}</div>
        </div>
        <div className="text-3xl font-extrabold tracking-tight text-text">{value}</div>
      </div>

      <div className="mt-3">
        {progressValue !== undefined ? (
          <div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            {trendText && (
              <span className="block mt-2 text-xs text-text-muted font-medium">
                {trendText}
              </span>
            )}
          </div>
        ) : (
          trendText && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${trendColors[trendType]}`}>
              {trendText}
            </span>
          )
        )}
      </div>
    </Card>
  );
};