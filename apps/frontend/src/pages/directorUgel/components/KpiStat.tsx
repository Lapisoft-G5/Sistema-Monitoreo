import type { ReactNode } from 'react';
import { Card } from '@shared/ui/card';

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

const toneText: Record<Tone, string> = {
  neutral: 'text-text',
  success: 'text-green-600',
  warning: 'text-amber-600',
  danger: 'text-destructive',
};
const toneBg: Record<Tone, string> = {
  neutral: 'bg-muted text-text-muted',
  success: 'bg-green-500/10 text-green-600',
  warning: 'bg-amber-500/10 text-amber-600',
  danger: 'bg-destructive/10 text-destructive',
};

interface KpiStatProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  tone?: Tone;
}

export const KpiStat = ({ label, value, sub, icon, tone = 'neutral' }: KpiStatProps) => (
  <Card className="p-4 border-border shadow-xs flex items-center gap-3">
    <div className={`p-2.5 rounded-lg shrink-0 ${toneBg[tone]}`}>{icon}</div>
    <div className="min-w-0">
      <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted truncate">
        {label}
      </div>
      <div className={`text-2xl font-extrabold leading-tight ${toneText[tone]}`}>{value}</div>
      {sub && <div className="text-xs text-text-muted truncate">{sub}</div>}
    </div>
  </Card>
);
