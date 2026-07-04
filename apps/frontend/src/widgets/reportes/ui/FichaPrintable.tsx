import { forwardRef } from 'react';
import type { Cronograma } from '@/entities/model-cronogramas';
import type { Plantilla } from '@/entities/model-plantillas';

interface FichaPrintableProps {
  visit: Cronograma;
  template: Plantilla;
  fichaState: {
    checkedAspects: Record<string, boolean>;
    selectedLevels: Record<string, string>;
    generalComments: string;
    sugerencias?: string;
    compromisos?: string;
    preguntaExtraAnswers?: Record<string, boolean>;
    respuestasEjeItem?: Record<string, number>;
  };
}

const formatVisitDate = (fechaHoraStr: string) => {
  try {
    const d = new Date(fechaHoraStr);
    if (!isNaN(d.getTime())) {
      const MONTH_NAMES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}, ${d.getFullYear()}`;
    }
    return fechaHoraStr.split('T')[0];
  } catch {
    return fechaHoraStr;
  }
};

export const FichaPrintable = forwardRef<HTMLDivElement, FichaPrintableProps>(
  ({ visit, template, fichaState }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black font-sans text-[12px] leading-snug w-full">
        {/* Encabezado */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">
              FICHA DE {template.tipoMonitoreo.toUpperCase()} - {template.anioAcademico}
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              {template.descripcion}
            </p>
          </div>
          <div className="text-right text-xs">
            <p><span className="font-bold">Fecha de Reporte:</span> {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Metadatos */}
        <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded p-4 mb-6 bg-slate-50">
          <div><span className="font-bold text-slate-700">I.E. Monitoreada:</span> {visit.institucion}</div>
          <div><span className="font-bold text-slate-700">Docente/Directivo:</span> {visit.docenteDirectivo}</div>
          <div><span className="font-bold text-slate-700">Especialista a cargo:</span> {visit.especialista}</div>
          <div><span className="font-bold text-slate-700">Fecha de Ejecución:</span> {formatVisitDate(visit.fechaHora)}</div>
        </div>

        {/* Desempeños */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold border-b border-slate-300 pb-1">I. DESEMPEÑOS EVALUADOS</h2>
          
          {template.desempenos.map((des, idx) => {
            const selectedLevelVal = fichaState.selectedLevels[des.id];
            const rubDetail = des.rubrica?.find((r) => r.nivel === selectedLevelVal);
            const levelConfig = template.niveles.find((n) => n.nivel === selectedLevelVal);
            
            return (
              <div key={des.id} className="border border-slate-200 rounded p-4 break-inside-avoid">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-bold text-[13px]">
                    {idx + 1}. {des.nombre}
                  </h3>
                  {selectedLevelVal && (
                    <div className="shrink-0 px-3 py-1 rounded text-white font-bold text-xs" style={{ backgroundColor: levelConfig?.color || '#475569' }}>
                      Nivel {selectedLevelVal}
                    </div>
                  )}
                </div>
                
                <p className="text-slate-600 italic mb-3">{des.descripcionCorta}</p>

                {/* Respuesta a Pregunta Extra */}
                {des.preguntaExtra && (
                  <div className="bg-slate-50 border border-slate-200 p-2 mb-3 rounded text-xs">
                    <span className="font-bold">Pregunta:</span> {des.preguntaExtra} <br />
                    <span className="font-bold mt-1 inline-block">Respuesta:</span>{' '}
                    {fichaState.preguntaExtraAnswers?.[des.id] === true ? 'SÍ' : fichaState.preguntaExtraAnswers?.[des.id] === false ? 'NO' : 'Sin responder'}
                  </div>
                )}

                {/* Justificación del Nivel */}
                {selectedLevelVal && (
                  <div className="text-xs border-l-2 pl-3" style={{ borderColor: levelConfig?.color || '#475569' }}>
                    <p className="font-bold mb-1">Descripción del nivel alcanzado ({levelConfig?.denominacion}):</p>
                    <p className="text-slate-700">{rubDetail?.descripcion || 'Sin descripción en rúbrica'}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ejes e Items */}
        {template.ejesItems && template.ejesItems.length > 0 && (
          <div className="space-y-4 mt-8 break-before-auto">
            <h2 className="text-lg font-bold border-b border-slate-300 pb-1">II. EJES E ITEMS</h2>
            <div className="w-full border-collapse border border-slate-300">
              <div className="grid grid-cols-[auto_1fr_auto] bg-slate-100 font-bold border-b border-slate-300">
                <div className="p-2 border-r border-slate-300 text-center">N°</div>
                <div className="p-2 border-r border-slate-300">Descripción</div>
                <div className="p-2 text-center w-24">Nivel</div>
              </div>
              {template.ejesItems.map((item) => {
                const nivel = fichaState.respuestasEjeItem?.[item.id];
                const levelRom = nivel ? ['', 'I', 'II', 'III', 'IV'][nivel] : null;
                return (
                  <div key={item.id} className="grid grid-cols-[auto_1fr_auto] border-b border-slate-200 text-xs items-center">
                    <div className="p-2 border-r border-slate-200 text-center w-10">{item.numero}</div>
                    <div className="p-2 border-r border-slate-200">{item.descripcion}</div>
                    <div className="p-2 text-center font-bold">
                      {levelRom ? `Nivel ${levelRom}` : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sugerencias y Compromisos */}
        <div className="space-y-4 mt-8 break-inside-avoid">
          <h2 className="text-lg font-bold border-b border-slate-300 pb-1">III. SUGERENCIAS Y COMPROMISOS</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-300 rounded p-4">
              <h3 className="font-bold text-sm mb-2 text-slate-800">Sugerencias del Especialista</h3>
              <p className="text-xs text-slate-700 whitespace-pre-wrap">
                {fichaState.sugerencias || 'No se registraron sugerencias.'}
              </p>
            </div>
            <div className="border border-slate-300 rounded p-4">
              <h3 className="font-bold text-sm mb-2 text-slate-800">Compromisos del Evaluado</h3>
              <p className="text-xs text-slate-700 whitespace-pre-wrap">
                {fichaState.compromisos || 'No se registraron compromisos.'}
              </p>
            </div>
          </div>
        </div>

        {/* Firmas */}
        <div className="mt-16 pt-8 break-inside-avoid">
          <div className="flex justify-around items-end">
            <div className="text-center w-48">
              <div className="border-b border-slate-400 mb-2"></div>
              <p className="font-bold text-xs">Firma del Especialista</p>
              <p className="text-[10px] text-slate-500">{visit.especialista}</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b border-slate-400 mb-2"></div>
              <p className="font-bold text-xs">Firma del Evaluado</p>
              <p className="text-[10px] text-slate-500">{visit.docenteDirectivo}</p>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-12 text-center text-[9px] text-slate-400 border-t border-slate-200 pt-2">
          Generado automáticamente por el Sistema de Monitoreo - UGEL LAMPA
        </div>
      </div>
    );
  }
);
FichaPrintable.displayName = 'FichaPrintable';
