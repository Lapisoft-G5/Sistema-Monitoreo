import type { ReactNode } from 'react';
import { StatCard } from './Stat-Card';

export interface StatsCardDef {
  title: string;
  icon: ReactNode;
  value: string | number;
  trendText?: string;
  trendType?: 'success' | 'warning' | 'danger' | 'neutral';
  progressValue?: number;
}

interface EntityStatsProps {
  cards: StatsCardDef[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnsClass: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function EntityStats({ cards, columns = 3, className = '' }: EntityStatsProps) {
  return (
    <div className={`grid ${columnsClass[columns]} gap-5 ${className}`}>
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}
