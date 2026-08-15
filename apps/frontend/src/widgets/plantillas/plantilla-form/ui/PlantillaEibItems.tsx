import { useState } from 'react';
import { Plus, Trash2, Layers, FolderPlus, PlusCircle } from 'lucide-react';
import { SectionCard } from '@shared/ui/form-controls';
import type { Desempeno } from '@entities/model-plantillas';

interface ItemEib {
  id: string;
  texto: string;
}

interface SubcriterioEib {
  id: string;
  subcriterio: string; // Ej. "2.1. Interacciones pedagógicas en el aula" o ""
  items: ItemEib[];
}

interface SeccionEib {
  id: string;
  seccion: string; // Ej. "II. DESARROLLO DE LA PLANIFICACIÓN A CORTO PLAZO"
  subcriterios: SubcriterioEib[];
}

interface Props {
  criterios: Desempeno[];
  onChange: (criterios: Desempeno[]) => void;
}

/** Transforma la lista plana de desempeños en la estructura jerárquica de Secciones -> Subcriterios -> Ítems */
function desempanosABloques(criterios: Desempeno[]): SeccionEib[] {
  if (!criterios || criterios.length === 0) {
    return [
      {
        id: crypto.randomUUID(),
        seccion: 'I. CONDICIONES BÁSICAS PARA EL APRENDIZAJE',
        subcriterios: [
          {
            id: crypto.randomUUID(),
            subcriterio: '',
            items: [{ id: crypto.randomUUID(), texto: '' }],
          },
        ],
      },
    ];
  }

  const secciones: SeccionEib[] = [];
  let currentSeccion: SeccionEib | null = null;
  let currentSubcriterio: SubcriterioEib | null = null;
  let currentSubKey = '';

  for (const c of criterios) {
    const rawKey = c.descripcionCorta?.trim() || 'I. CONDICIONES BÁSICAS PARA EL APRENDIZAJE';
    const partes = rawKey.split(' — ');
    const seccionNombre = partes[0] || rawKey;
    const subcriterioNombre = partes.length > 1 ? partes.slice(1).join(' — ') : '';

    if (!currentSeccion || currentSeccion.seccion !== seccionNombre) {
      currentSeccion = {
        id: crypto.randomUUID(),
        seccion: seccionNombre,
        subcriterios: [],
      };
      secciones.push(currentSeccion);
      currentSubcriterio = null;
      currentSubKey = '';
    }

    if (!currentSubcriterio || currentSubKey !== subcriterioNombre) {
      currentSubKey = subcriterioNombre;
      currentSubcriterio = {
        id: crypto.randomUUID(),
        subcriterio: subcriterioNombre,
        items: [],
      };
      currentSeccion.subcriterios.push(currentSubcriterio);
    }

    currentSubcriterio.items.push({
      id: c.id,
      texto: c.nombre,
    });
  }

  return secciones.length > 0
    ? secciones
    : [
        {
          id: crypto.randomUUID(),
          seccion: 'I. CONDICIONES BÁSICAS PARA EL APRENDIZAJE',
          subcriterios: [
            {
              id: crypto.randomUUID(),
              subcriterio: '',
              items: [{ id: crypto.randomUUID(), texto: '' }],
            },
          ],
        },
      ];
}

/** Convierte la estructura jerárquica en la lista plana que persiste el backend */
function bloquesADesempenos(secciones: SeccionEib[]): Desempeno[] {
  const result: Desempeno[] = [];

  for (const sec of secciones) {
    const seccionTxt = sec.seccion.trim();

    for (const sub of sec.subcriterios) {
      const subTxt = sub.subcriterio.trim();
      const etiqueta = subTxt
        ? seccionTxt
          ? `${seccionTxt} — ${subTxt}`
          : subTxt
        : seccionTxt;

      for (const item of sub.items) {
        result.push({
          id: item.id,
          nombre: item.texto,
          descripcionCorta: etiqueta,
          preguntaExtra: '',
          aspectos: [],
          rubrica: [],
        });
      }
    }
  }

  return result;
}

export const PlantillaEibItems = ({ criterios, onChange }: Props) => {
  const [secciones, setSecciones] = useState<SeccionEib[]>(() => desempanosABloques(criterios));

  // Notificar al padre cada vez que cambie la estructura interna
  const sincronizar = (nuevasSecciones: SeccionEib[]) => {
    setSecciones(nuevasSecciones);
    onChange(bloquesADesempenos(nuevasSecciones));
  };

  // --- Manejo de Secciones Principales ---
  const agregarSeccion = () => {
    const nueva: SeccionEib = {
      id: crypto.randomUUID(),
      seccion: '',
      subcriterios: [
        {
          id: crypto.randomUUID(),
          subcriterio: '',
          items: [{ id: crypto.randomUUID(), texto: '' }],
        },
      ],
    };
    sincronizar([...secciones, nueva]);
  };

  const eliminarSeccion = (seccionId: string) => {
    if (secciones.length <= 1) return;
    sincronizar(secciones.filter((s) => s.id !== seccionId));
  };

  const actualizarSeccionNombre = (seccionId: string, seccion: string) => {
    sincronizar(secciones.map((s) => (s.id === seccionId ? { ...s, seccion } : s)));
  };

  // --- Manejo de Subcriterios ---
  const agregarSubcriterio = (seccionId: string) => {
    const nuevoSub: SubcriterioEib = {
      id: crypto.randomUUID(),
      subcriterio: '',
      items: [{ id: crypto.randomUUID(), texto: '' }],
    };
    sincronizar(
      secciones.map((s) =>
        s.id === seccionId ? { ...s, subcriterios: [...s.subcriterios, nuevoSub] } : s,
      ),
    );
  };

  const eliminarSubcriterio = (seccionId: string, subcriterioId: string) => {
    sincronizar(
      secciones.map((s) => {
        if (s.id !== seccionId) return s;
        if (s.subcriterios.length <= 1) return s;
        return {
          ...s,
          subcriterios: s.subcriterios.filter((sub) => sub.id !== subcriterioId),
        };
      }),
    );
  };

  const actualizarSubcriterioNombre = (
    seccionId: string,
    subcriterioId: string,
    subcriterio: string,
  ) => {
    sincronizar(
      secciones.map((s) => {
        if (s.id !== seccionId) return s;
        return {
          ...s,
          subcriterios: s.subcriterios.map((sub) =>
            sub.id === subcriterioId ? { ...sub, subcriterio } : sub,
          ),
        };
      }),
    );
  };

  // --- Manejo de Ítems ---
  const agregarItem = (seccionId: string, subcriterioId: string) => {
    const nuevoItem: ItemEib = {
      id: crypto.randomUUID(),
      texto: '',
    };
    sincronizar(
      secciones.map((s) => {
        if (s.id !== seccionId) return s;
        return {
          ...s,
          subcriterios: s.subcriterios.map((sub) =>
            sub.id === subcriterioId ? { ...sub, items: [...sub.items, nuevoItem] } : sub,
          ),
        };
      }),
    );
  };

  const eliminarItem = (seccionId: string, subcriterioId: string, itemId: string) => {
    sincronizar(
      secciones.map((s) => {
        if (s.id !== seccionId) return s;
        return {
          ...s,
          subcriterios: s.subcriterios.map((sub) => {
            if (sub.id !== subcriterioId) return sub;
            if (sub.items.length <= 1) return sub;
            return {
              ...sub,
              items: sub.items.filter((it) => it.id !== itemId),
            };
          }),
        };
      }),
    );
  };

  const actualizarItemTexto = (
    seccionId: string,
    subcriterioId: string,
    itemId: string,
    texto: string,
  ) => {
    sincronizar(
      secciones.map((s) => {
        if (s.id !== seccionId) return s;
        return {
          ...s,
          subcriterios: s.subcriterios.map((sub) => {
            if (sub.id !== subcriterioId) return sub;
            return {
              ...sub,
              items: sub.items.map((it) => (it.id === itemId ? { ...it, texto } : it)),
            };
          }),
        };
      }),
    );
  };

  const totalItems = secciones.reduce(
    (acc, s) => acc + s.subcriterios.reduce((subAcc, sub) => subAcc + sub.items.length, 0),
    0,
  );

  return (
    <SectionCard
      icon={<Layers className="w-5 h-5 text-primary" />}
      title="2. Estructura Jerárquica EIB: Secciones, Subcriterios e Ítems"
      headerRight={
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {secciones.length} {secciones.length === 1 ? 'Sección' : 'Secciones'}
          </span>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {totalItems} {totalItems === 1 ? 'Ítem Total' : 'Ítems Totales'}
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <p className="text-xs text-text-muted leading-relaxed">
          Escribe la <strong>Sección o Dimensión Principal</strong> una sola vez y añade adentro todos los <strong>Subcriterios</strong> (ej. <em>2.1 Interacciones</em>, <em>2.2 Diálogo de saberes</em>) con sus respectivos ítems observables.
        </p>

        {/* Lista de Secciones Principales */}
        <div className="flex flex-col gap-6">
          {secciones.map((sec, indexSec) => (
            <div
              key={sec.id}
              className="rounded-2xl border-2 border-slate-200 bg-surface shadow-xs overflow-hidden transition-all hover:border-primary/40"
            >
              {/* Encabezado de la Sección Principal */}
              <div className="p-4 bg-slate-100/90 border-b border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 px-2.5 items-center justify-center rounded-md bg-primary text-[11px] font-black text-white shadow-xs">
                      SECCIÓN {indexSec + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {sec.subcriterios.length} {sec.subcriterios.length === 1 ? 'grupo' : 'grupos'}
                    </span>
                  </div>

                  {secciones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarSeccion(sec.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar esta sección completa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Eliminar Sección</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                    Título de la Sección o Dimensión Principal <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={sec.seccion}
                    onChange={(e) => actualizarSeccionNombre(sec.id, e.target.value)}
                    placeholder="Ej. II. DESARROLLO DE LA PLANIFICACIÓN A CORTO PLAZO"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-xs"
                    required
                  />
                </div>
              </div>

              {/* Subcriterios / Grupos dentro de la Sección */}
              <div className="p-4 flex flex-col gap-5 bg-slate-50/40">
                {sec.subcriterios.map((sub, indexSub) => (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col gap-3.5"
                  >
                    {/* Cabecera del Subcriterio */}
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                      <div className="flex-1 flex items-center gap-2.5">
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0">
                          Subcriterio {indexSec + 1}.{indexSub + 1}:
                        </span>
                        <input
                          type="text"
                          value={sub.subcriterio}
                          onChange={(e) =>
                            actualizarSubcriterioNombre(sec.id, sub.id, e.target.value)
                          }
                          placeholder="Ej. 2.1. Interacciones pedagógicas en el aula (dejar vacío si no aplica)"
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      {sec.subcriterios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarSubcriterio(sec.id, sub.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                          title="Eliminar este subcriterio"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Ítems del Subcriterio */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Ítems Observables</span>
                        <span>Escala: Sí | Parcialmente | No</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {sub.items.map((item, indexItem) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-600">
                              {indexItem + 1}
                            </span>

                            <input
                              type="text"
                              value={item.texto}
                              onChange={(e) =>
                                actualizarItemTexto(sec.id, sub.id, item.id, e.target.value)
                              }
                              placeholder="Ej. El docente comunica el propósito de aprendizaje y los criterios de evaluación."
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none shadow-2xs"
                              required
                            />

                            {sub.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => eliminarItem(sec.id, sub.id, item.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                                title="Eliminar ítem"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => agregarItem(sec.id, sub.id)}
                        className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-dashed border-primary/40 text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer mt-1 self-start"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Agregar Ítem</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Botón para añadir otro subcriterio a esta misma sección */}
                <button
                  type="button"
                  onClick={() => agregarSubcriterio(sec.id)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-primary/50 bg-white text-xs font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer shadow-2xs self-start"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>+ Agregar Subcriterio a esta Sección</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Botón para añadir una nueva sección principal */}
        <button
          type="button"
          onClick={agregarSeccion}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-xs font-black text-primary hover:bg-primary/10 transition-colors cursor-pointer shadow-xs"
        >
          <FolderPlus className="h-4 w-4" />
          <span>+ Agregar Nueva Sección o Dimensión Principal EIB</span>
        </button>
      </div>
    </SectionCard>
  );
};
