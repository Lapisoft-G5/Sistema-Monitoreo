import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import { Button } from '@shared/ui/button';
import { useNotificaciones, useMarcarLeida, useMarcarTodasLeidas } from '../api/use-notifications-api';

const tiempoRelativo = (iso: string): string => {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `hace ${h} h`;
  return new Date(iso).toLocaleDateString('es-PE');
};

export const NotificationsBell = () => {
  const { data } = useNotificaciones();
  const marcarLeida = useMarcarLeida();
  const marcarTodas = useMarcarTodasLeidas();
  const [expandida, setExpandida] = useState<string | null>(null);

  const toggle = (id: string, leida: boolean) => {
    setExpandida((prev) => (prev === id ? null : id));
    if (!leida) marcarLeida.mutate(id);
  };

  const items = data?.items ?? [];
  const noLeidas = data?.noLeidas ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-text-muted hover:text-text hover:bg-muted cursor-pointer rounded-lg"
        >
          <Bell className="h-[18px] w-[18px]" />
          {noLeidas > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-surface">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-bold text-sm">Notificaciones</span>
          {noLeidas > 0 && (
            <button
              onClick={() => marcarTodas.mutate()}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Marcar todas
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">Sin notificaciones.</p>
          ) : (
            items.map((n) => {
              const abierta = expandida === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => toggle(n.id, n.leida)}
                  className={`flex gap-3 px-4 py-3 border-b border-border/60 last:border-0 cursor-pointer hover:bg-muted/40 ${
                    n.leida ? 'opacity-70' : 'bg-primary/5'
                  }`}
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      n.leida ? 'bg-transparent' : 'bg-primary'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-semibold text-sm ${abierta ? '' : 'line-clamp-2'}`}>
                        {n.titulo}
                      </span>
                      <span className="text-[10px] text-text-muted shrink-0 whitespace-nowrap">
                        {tiempoRelativo(n.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs text-text-muted mt-0.5 whitespace-pre-line ${
                        abierta ? '' : 'line-clamp-2'
                      }`}
                    >
                      {n.mensaje}
                    </p>
                    {n.emisorNombre && abierta && (
                      <p className="text-[11px] text-text-muted mt-1.5">— {n.emisorNombre}</p>
                    )}
                    <span className="mt-1 inline-block text-[11px] font-semibold text-primary">
                      {abierta ? 'Ver menos' : 'Ver más'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
