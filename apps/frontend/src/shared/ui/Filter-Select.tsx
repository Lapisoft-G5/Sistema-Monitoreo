import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
}

export const FilterSelect = ({ label, value, onChange, options, allLabel }: FilterSelectProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[0.7rem] font-bold uppercase tracking-wider text-text-muted">
      {label}
    </label>
    <Select value={value || 'todos'} onValueChange={(v) => onChange(v === 'todos' ? '' : v)}>
      <SelectTrigger className="w-full text-left text-sm bg-surface border-border text-text h-9">
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
