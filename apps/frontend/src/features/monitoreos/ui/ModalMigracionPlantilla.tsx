import { useState } from 'react';
import { AlertCircle, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

interface ModalMigracionPlantillaProps {
  isOpen: boolean;
  onClose: () => void;
  fichaId: string;
  plantillaActualId: string;
  plantillaNuevaId: string;
  plantillaNuevaNombre: string;
  onMigrar: () => Promise<void>;
  onFinalizarConV1: () => Promise<void>;
}

export const ModalMigracionPlantilla = ({
  isOpen,
  onClose,
  plantillaNuevaNombre,
  onMigrar,
  onFinalizarConV1,
}: ModalMigracionPlantillaProps) => {
  const [loading, setLoading] = useState<'migrar' | 'v1' | null>(null);

  if (!isOpen) return null;

  const handleMigrar = async () => {
    setLoading('migrar');
    try {
      await onMigrar();
    } finally {
      setLoading(null);
    }
  };

  const handleV1 = async () => {
    setLoading('v1');
    try {
      await onFinalizarConV1();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="bg-surface w-full max-w-[600px] border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border bg-amber-50/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold text-[10px]">
                ILA-0046: Plantilla actualizada
              </Badge>
              <h3 className="text-base font-extrabold text-slate-800">
                La plantilla original paso a Historico
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                La plantilla que estas usando fue archivada porque un editor la modifico
                y se genero una nueva version. Tu borrador de ficha sigue vinculado a la
                version anterior (v1) y debes decidir como proceder.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            Opciones disponibles
          </div>

          <button
            onClick={handleMigrar}
            disabled={!!loading}
            className="w-full text-left p-4 border-2 border-primary/30 bg-primary-light/30 rounded-xl hover:border-primary hover:bg-primary-light/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                {loading === 'migrar' ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-sm font-extrabold text-slate-800 group-hover:text-primary">
                  Migrar respuestas a la nueva version
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tus niveles y checklist se conservan mapeando desempenos por nombre
                  y aspectos por descripcion. Si una respuesta no tiene equivalente en la
                  nueva plantilla, se pierde.
                </p>
                <div className="text-[10px] font-bold text-primary mt-1">
                  → {plantillaNuevaNombre}
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleV1}
            disabled={!!loading}
            className="w-full text-left p-4 border-2 border-slate-200 bg-slate-50/50 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0">
                {loading === 'v1' ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-sm font-extrabold text-slate-800">
                  Finalizar con la version original (v1)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conservas la ficha exactamente como la llenaste con la plantilla v1.
                  La version v1 queda congelada como Historico y la ficha queda
                  asociada a ella para preservar la trazabilidad.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="p-4 border-t border-border bg-slate-50 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={!!loading}
            className="text-xs font-bold text-slate-600 border-slate-200 px-4 py-2 h-9 rounded-lg"
          >
            <X className="h-4 w-4 mr-1.5" />
            Cancelar
          </Button>
        </div>
      </Card>
    </div>
  );
};
