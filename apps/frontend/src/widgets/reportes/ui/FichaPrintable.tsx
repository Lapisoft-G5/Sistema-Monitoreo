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
    rubricComments?: Record<string, string>;
    preguntaExtraAnswers?: Record<string, boolean>;
    respuestasEjeItem?: Record<string, number>;
    evidenciaUrls?: Record<string, string>;
    contexto?: {
      areaCurricular: string;
      grado: string;
      seccion: string;
      cantidadEstudiantes: number;
      cantidadEstudiantesNee: number;
    };
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
        <div className="text-center italic text-[10px] mb-2">
          Año de la recuperación y consolidación de la economía peruana
        </div>
        <h2 className="text-center text-sm font-bold uppercase mb-4">
          FICHA DE {template.tipoMonitoreo.toUpperCase()} {template.anioAcademico}
        </h2>

        <style>{`
          @page { size: portrait; margin: 15mm; }
          .pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
          .pdf-table td { border: 1px solid #000; padding: 3px 5px; }
          .pdf-table .bg-gray { background-color: #f0f4f8; font-weight: bold; }
          .pdf-section-title { font-weight: bold; text-transform: uppercase; margin-bottom: 2px; font-size: 11px; }
        `}</style>

        {visit.tipo === 'DIRECTIVO' ? (
          <>
            {/* DATOS DE LA INSTITUCIÓN EDUCATIVA */}
            <div className="pdf-section-title">DATOS DE LA INSTITUCIÓN EDUCATIVA:</div>
            <table className="pdf-table">
              <tbody>
                <tr>
                  <td className="bg-gray" style={{ width: '20%' }}>UGEL:</td>
                  <td colSpan={5}>UGEL LAMPA</td>
                </tr>
                <tr>
                  <td className="bg-gray">INSTITUCIÓN EDUCATIVA:</td>
                  <td colSpan={3}>{visit.institucion}</td>
                  <td className="bg-gray" style={{ width: '15%' }}>CÓD. MODULAR:</td>
                  <td style={{ width: '20%' }}></td>
                </tr>
                <tr>
                  <td className="bg-gray">MODALIDAD:</td>
                  <td style={{ width: '25%' }}>{visit.modalidad || ''}</td>
                  <td className="bg-gray" style={{ width: '10%' }}>NIVEL:</td>
                  <td style={{ width: '20%' }}>{visit.nivel || ''}</td>
                  <td className="bg-gray" style={{ width: '10%' }}>ÁREA:</td>
                  <td style={{ width: '15%' }}>{fichaState.contexto?.areaCurricular || ''}</td>
                </tr>
                <tr>
                  <td className="bg-gray">APELLIDOS Y NOMBRES DEL DIRECTOR(A):</td>
                  <td colSpan={5}>{visit.docenteDirectivo}</td>
                </tr>
                <tr>
                  <td className="bg-gray">DNI:</td>
                  <td></td>
                  <td className="bg-gray">E-MAIL:</td>
                  <td colSpan={2}></td>
                  <td><span className="font-bold">N° CELULAR:</span> </td>
                </tr>
                <tr>
                  <td className="bg-gray">ENCARGADO:</td>
                  <td></td>
                  <td className="bg-gray">DESIGNADO:</td>
                  <td colSpan={2}></td>
                  <td><span className="font-bold">NOMBRADO:</span> </td>
                </tr>
              </tbody>
            </table>

            {/* DATOS DEL MONITOR */}
            <div className="pdf-section-title">DATOS DEL MONITOR:</div>
            <table className="pdf-table">
              <tbody>
                <tr>
                  <td className="bg-gray" style={{ width: '30%' }}>APELLIDOS Y NOMBRES MONITOR(A) DREP</td>
                  <td colSpan={7}></td>
                </tr>
                <tr>
                  <td className="bg-gray">DNI</td>
                  <td></td>
                  <td className="bg-gray">CARGO</td>
                  <td></td>
                  <td className="bg-gray">E-MAIL</td>
                  <td></td>
                  <td className="bg-gray">N° CELULAR</td>
                  <td></td>
                </tr>
                <tr>
                  <td className="bg-gray" style={{ width: '30%' }}>APELLIDOS Y NOMBRES MONITOR(A) UGEL</td>
                  <td colSpan={7}>{visit.especialista}</td>
                </tr>
                <tr>
                  <td className="bg-gray">DNI</td>
                  <td></td>
                  <td className="bg-gray">CARGO</td>
                  <td></td>
                  <td className="bg-gray">E-MAIL</td>
                  <td></td>
                  <td className="bg-gray">N° CELULAR</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <>
            {/* DATOS DE LA INSTITUCIÓN EDUCATIVA (DOCENTE) */}
            <div className="pdf-section-title">DATOS DE LA INSTITUCIÓN EDUCATIVA:</div>
            <table className="pdf-table">
              <tbody>
                <tr>
                  <td className="bg-gray" style={{ width: '20%' }}>UGEL:</td>
                  <td colSpan={5}>UGEL LAMPA</td>
                </tr>
                <tr>
                  <td className="bg-gray">INSTITUCIÓN EDUCATIVA:</td>
                  <td colSpan={5}>{visit.institucion}</td>
                </tr>
                <tr>
                  <td className="bg-gray">MODALIDAD:</td>
                  <td style={{ width: '20%' }}>{visit.modalidad || ''}</td>
                  <td className="bg-gray" style={{ width: '10%' }}>NIVEL:</td>
                  <td style={{ width: '20%' }}>{visit.nivel || ''}</td>
                  <td className="bg-gray" style={{ width: '10%' }}>ÁREA:</td>
                  <td style={{ width: '20%' }}>{fichaState.contexto?.areaCurricular || ''}</td>
                </tr>
                <tr>
                  <td className="bg-gray">APELLIDOS Y NOMBRES DEL DIRECTOR(A):</td>
                  <td colSpan={5}></td>
                </tr>
                <tr>
                  <td className="bg-gray">DNI:</td>
                  <td></td>
                  <td className="bg-gray">E-MAIL:</td>
                  <td colSpan={2}></td>
                  <td><span className="font-bold">N° CELULAR:</span> </td>
                </tr>
                <tr>
                  <td className="bg-gray">ENCARGADO:</td>
                  <td></td>
                  <td className="bg-gray">DESIGNADO:</td>
                  <td colSpan={2}></td>
                  <td><span className="font-bold">ENC. X FUNCIONES:</span> </td>
                </tr>
              </tbody>
            </table>

            {/* DATOS DEL DOCENTE MONITOREADO */}
            <div className="pdf-section-title">DATOS DEL DOCENTE MONITOREADO:</div>
            <table className="pdf-table">
              <tbody>
                <tr>
                  <td className="bg-gray" style={{ width: '30%' }}>APELLIDOS Y NOMBRES DEL DOCENTE:</td>
                  <td colSpan={5}>{visit.docenteDirectivo}</td>
                </tr>
                <tr>
                  <td className="bg-gray">DNI:</td>
                  <td></td>
                  <td className="bg-gray">E-MAIL:</td>
                  <td colSpan={2}></td>
                  <td><span className="font-bold">N° CELULAR:</span> </td>
                </tr>
                <tr>
                  <td className="bg-gray">CONTRATADO:</td>
                  <td></td>
                  <td className="bg-gray">NOMBRADO:</td>
                  <td colSpan={2}></td>
                  <td><span className="font-bold">OTRO:</span> </td>
                </tr>
                <tr>
                  <td className="bg-gray">MODALIDAD:</td>
                  <td>{visit.modalidad || ''}</td>
                  <td className="bg-gray">NIVEL:</td>
                  <td colSpan={2}>{visit.nivel || ''}</td>
                  <td><span className="font-bold">ÁREA:</span> {fichaState.contexto?.areaCurricular || ''}</td>
                </tr>
                <tr>
                  <td className="bg-gray">GRADO:</td>
                  <td>{fichaState.contexto?.grado || ''}</td>
                  <td className="bg-gray">SECCIÓN:</td>
                  <td>{fichaState.contexto?.seccion || ''}</td>
                  <td><span className="font-bold">CANT. ESTUDIANTES:</span> {fichaState.contexto?.cantidadEstudiantes || ''}</td>
                  <td><span className="font-bold">NEE:</span> {fichaState.contexto?.cantidadEstudiantesNee || ''}</td>
                </tr>
              </tbody>
            </table>

            {/* DATOS DEL(OS) MONITOR(ES) */}
            <div className="pdf-section-title">DATOS DEL(OS) MONITOR(ES):</div>
            <table className="pdf-table">
              <tbody>
                <tr>
                  <td className="bg-gray" style={{ width: '20%' }}>APELLIDOS Y NOMBRES:</td>
                  <td colSpan={5}>
                    <span className="mr-4">DREP ( )</span>
                    <span className="mr-4">UGEL (X) {visit.especialista}</span>
                    <span className="mr-4">DIRECTOR IE ( )</span>
                    <span>COORDINADOR ( )</span>
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray">DNI:</td>
                  <td style={{ width: '15%' }}></td>
                  <td className="bg-gray" style={{ width: '15%' }}>E-MAIL:</td>
                  <td colSpan={2}></td>
                  <td><span className="font-bold">N° CELULAR:</span> </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* FECHA Y DURACIÓN */}
        <div className="pdf-section-title">FECHA Y DURACIÓN:</div>
        <table className="pdf-table" style={{ marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td className="bg-gray" style={{ width: '10%' }}>FECHA:</td>
              <td>{formatVisitDate(visit.fechaHora)}</td>
              <td className="bg-gray" style={{ width: '15%' }}>HORA INICIO:</td>
              <td>{
                !isNaN(new Date(visit.fechaHora).getTime()) 
                  ? new Date(visit.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                  : ''
              }</td>
              <td className="bg-gray" style={{ width: '15%' }}>HORA FINAL:</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* Desempeños */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold border-b border-slate-300 pb-1">I. DESEMPEÑOS EVALUADOS</h2>
          
          {template.desempenos.map((des, idx) => {
            const selectedLevelVal = fichaState.selectedLevels[des.id];
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
                  <div className="text-xs border-l-2 pl-3 mt-3" style={{ borderColor: levelConfig?.color || '#475569' }}>
                    <p className="font-bold mb-1 text-slate-700">Justificación y Evidencias:</p>
                    <p className="text-slate-800 whitespace-pre-wrap">{fichaState.rubricComments?.[des.id] || 'Sin justificación registrada.'}</p>
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
            <table className="pdf-table" style={{ marginBottom: '20px' }}>
              <thead>
                <tr>
                  <td className="bg-gray text-center" style={{ width: '5%' }}>N°</td>
                  <td className="bg-gray">Descripción</td>
                  <td className="bg-gray text-center" style={{ width: '15%' }}>Nivel</td>
                </tr>
              </thead>
              <tbody>
                {template.ejesItems.map((item) => {
                  const nivel = fichaState.respuestasEjeItem?.[item.id];
                  const levelRom = nivel ? ['', 'I', 'II', 'III', 'IV'][nivel] : null;
                  return (
                    <tr key={item.id}>
                      <td className="text-center font-bold">{item.numero}</td>
                      <td>{item.descripcion}</td>
                      <td className="text-center font-bold">
                        {levelRom ? `Nivel ${levelRom}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

        {/* Consolidado */}
        {(() => {
          const romanToNum = (r: string) => ({ I: 1, II: 2, III: 3, IV: 4 }[r as string] ?? 0);
          const numDesempenos = template.desempenos.length;
          const puntajeMax = numDesempenos * 4;
          const puntajeMin = numDesempenos * 1;
          const puntajeTotal = template.desempenos.reduce(
            (acc, d) => acc + romanToNum(fichaState.selectedLevels[d.id] || ''),
            0
          );
          
          let nivel = '';
          if (numDesempenos === 5) {
            if (puntajeTotal >= 5 && puntajeTotal <= 7) nivel = 'INICIO';
            else if (puntajeTotal >= 8 && puntajeTotal <= 12) nivel = 'EN PROCESO';
            else if (puntajeTotal >= 13 && puntajeTotal <= 17) nivel = 'LOGRO ESPERADO';
            else if (puntajeTotal >= 18) nivel = 'LOGRO DESTACADO';
          } else if (numDesempenos > 0) {
            if (puntajeTotal <= puntajeMin + Math.floor((puntajeMax - puntajeMin) * 0.25)) nivel = 'INICIO';
            else if (puntajeTotal <= puntajeMin + Math.floor((puntajeMax - puntajeMin) * 0.50)) nivel = 'EN PROCESO';
            else if (puntajeTotal <= puntajeMin + Math.floor((puntajeMax - puntajeMin) * 0.75)) nivel = 'LOGRO ESPERADO';
            else nivel = 'LOGRO DESTACADO';
          }

          return (
            <div className="mt-8 break-inside-avoid">
              <div className="pdf-section-title">CONSOLIDADO DE NIVELES DE LOGRO:</div>
              <table className="pdf-table" style={{ marginBottom: '20px' }}>
                <tbody>
                  <tr>
                    <td className="bg-gray text-center w-32">ASPECTOS</td>
                    {template.desempenos.map((d, i) => (
                      <td key={d.id} className="bg-gray text-center w-12">D{i + 1}</td>
                    ))}
                    {template.ejesItems?.map((e, i) => (
                      <td key={e.id} className="bg-gray text-center w-12">R{template.desempenos.length + i + 1}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="bg-gray text-center">PUNTAJE</td>
                    {template.desempenos.map((d) => (
                      <td key={`puntaje-${d.id}`} className="text-center font-bold">
                        {fichaState.selectedLevels[d.id] ? romanToNum(fichaState.selectedLevels[d.id]) : ''}
                      </td>
                    ))}
                    {template.ejesItems?.map((e) => (
                      <td key={`puntaje-${e.id}`} className="text-center font-bold">
                        {fichaState.respuestasEjeItem?.[e.id] || ''}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="bg-gray text-center">TOTAL</td>
                    <td colSpan={template.desempenos.length + (template.ejesItems?.length || 0)} className="text-center font-bold text-sm">
                      {puntajeTotal > 0 ? puntajeTotal : ''}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray text-center">NIVEL DE LOGRO</td>
                    <td colSpan={template.desempenos.length + (template.ejesItems?.length || 0)} className="text-center font-bold text-sm">
                      {nivel}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* EVIDENCIA GENERAL */}
        {fichaState.evidenciaUrls?.['GENERAL'] && (
          <div className="mt-8 break-inside-avoid">
            <div className="pdf-section-title">EVIDENCIAS DEL MONITOREO:</div>
            <div className="mt-2 text-center">
              <img 
                src={fichaState.evidenciaUrls['GENERAL']} 
                alt="Evidencia del Monitoreo" 
                className="max-w-full mx-auto"
                style={{ maxHeight: '300px', border: '1px solid #ccc', padding: '4px' }} 
              />
            </div>
          </div>
        )}

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
