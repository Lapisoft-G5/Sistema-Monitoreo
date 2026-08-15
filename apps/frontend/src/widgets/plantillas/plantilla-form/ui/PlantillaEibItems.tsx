import { useState } from 'react';
import { Plus, Trash2, Layers, FolderPlus } from 'lucide-react';
import { SectionCard } from '@shared/ui/form-controls';
import type { Desempeno } from '@entities/model-plantillas';

interface ItemEib {
  id: string;
  texto: string;
  foco?: string;
}

interface BloqueEib {
  id: string;
  seccion: string;
  subcriterio?: string;
  items: ItemEib[];
}

interface Props {
  criterios: Desempeno[];
  onChange: (criterios: Desempeno[]) => void;
}

/** Transforma la lista plana de desempeños en la estructura jerárquica de bloques */
function desempanosABloques(criterios: Desempeno[]): BloqueEib[] {
  if (!criterios || criterios.length === 0) {
    return [
      {
        id: crypto.randomUUID(),
        seccion: 'I. CONDICIONES BÁSICAS PARA EL APRENDIZAJE',
        subcriterio: '',
        items: [{ id: crypto.randomUUID(), texto: '', foco: '' }],
      },
    ];
  }

  const bloques: BloqueEib[] = [];
  let currentKey = '';
  let currentBloque: BloqueEib | null = null;

  for (const c of criterios) {
    const rawKey = c.descripcionCorta?.trim() || 'I. CONDICIONES BÁSICAS PARA EL APRENDIZAJE';
    if (!currentBloque || currentKey !== rawKey) {
      currentKey = rawKey;
      const partes = rawKey.split(' — ');
      const seccion = partes[0] || rawKey;
      const subcriterio = partes.length > 1 ? partes.slice(1).join(' — ') : '';

      currentBloque = {
        id: crypto.randomUUID(),
        seccion,
        subcriterio,
        items: [],
      };
      bloques.push(currentBloque);
    }

    currentBloque.items.push({
      id: c.id,
      texto: c.nombre,
      foco: c.aspectos?.[0]?.descripcion ?? '',
    });
  }

  return bloques.length > 0
    ? bloques
    : [
        {
          id: crypto.randomUUID(),
          seccion: 'I. CONDICIONES BÁSICAS PARA EL APRENDIZAJE',
          subcriterio: '',
          items: [{ id: crypto.randomUUID(), texto: '', foco: '' }],
        },
      ];
}

/** Convierte los bloques jerárquicos en la lista plana que consume el backend */
function bloquesADesempenos(bloques: BloqueEib[]): Desempeno[] {
  const result: Desempeno[] = [];

  for (const bloque of bloques) {
    const seccionTxt = bloque.seccion.trim();
    const subTxt = (bloque.subcriterio ?? '').trim();
    const etiqueta = subTxt
      ? seccionTxt
        ? `${seccionTxt} — ${subTxt}`
        : subTxt
      : seccionTxt;

    for (const item of bloque.items) {
      result.push({
        id: item.id,
        nombre: item.texto,
        descripcionCorta: etiqueta,
        preguntaExtra: '',
        aspectos: item.foco?.trim()
          ? [{ id: crypto.randomUUID(), descripcion: item.foco.trim() }]
          : [],
        rubrica: [],
      });
    }
  }

  return result;
}

export const PlantillaEibItems = ({ criterios, onChange }: Props) => {
  const [bloques, setBloques] = useState<BloqueEib[]>(() => desempanosABloques(criterios));

  // Notificar al padre cada vez que cambien los bloques internos
  const sincronizar = (nuevosBloques: BloqueEib[]) => {
    setBloques(nuevosBloques);
    onChange(bloquesADesempenos(nuevosBloques));
  };

  const agregarBloque = () => {
    const nuevoBloque: BloqueEib = {
      id: crypto.randomUUID(),
      seccion: '',
      subcriterio: '',
      items: [{ id: crypto.randomUUID(), texto: '', foco: '' }],
    };
    sincronizar([...bloques, nuevoBloque]);
  };

  const eliminarBloque = (bloqueId: string) => {
    if (bloques.length <= 1) return;
    sincronizar(bloques.filter((b) => b.id !== bloqueId));
  };

  const actualizarBloque = (bloqueId: string, patch: Partial<BloqueEib>) => {
    sincronizar(bloques.map((b) => (b.id === bloqueId ? { ...b, ...patch } : b)));
  };

  const agregarItem = (bloqueId: string) => {
    const nuevoItem: ItemEib = {
      id: crypto.randomUUID(),
      texto: '',
      foco: '',
    };
    sincronizar(
      bloques.map((b) => (b.id === bloqueId ? { ...b, items: [...b.items, nuevoItem] } : b)),
    );
  };

  const eliminarItem = (bloqueId: string, itemId: string) => {
    sincronizar(
      bloques.map((b) => {
        if (b.id !== bloqueId) return b;
        if (b.items.length <= 1) return b;
        return { ...b, items: b.items.filter((it) => it.id !== itemId) };
      }),
    );
  };

  const actualizarItem = (bloqueId: string, itemId: string, patch: Partial<ItemEib>) => {
    sincronizar(
      bloques.map((b) => {
        if (b.id !== bloqueId) return b;
        return {
          ...b,
          items: b.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
        };
      }),
    );
  };

  const totalItems = bloques.reduce((acc, b) => acc + b.items.length, 0);

  return (
    <SectionCard
      icon={<Layers className="w-5 h-5 text-primary" />}
      title="2. Estructura Jerárquica EIB: Secciones, Criterios e Ítems"
      headerRight={
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {bloques.length} {bloques.length === 1 ? 'Sección' : 'Secciones'}
          </span>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {totalItems} {totalItems === 1 ? 'Ítem Total' : 'Ítems Totales'}
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <p className="text-xs text-text-muted leading-relaxed">
          Organiza el instrumento en <strong>Bloques o Dimensiones</strong> (ej. <em>I. Condiciones Básicas</em>, <em>II. Desarrollo de la Planificación</em>) y <strong>Subcriterios</strong> (ej. <em>2.1 Interacciones</em>). Cada bloque agrupa sus propios ítems de observación sin necesidad de repetir títulos.
        </p>

        {/* Lista de Bloques / Secciones */}
        <div className="flex flex-col gap-6">
          {bloques.map((bloque, indexBloque) => (
            <div
              key={bloque.id}
              className="rounded-2xl border border-slate-200 bg-surface shadow-xs overflow-hidden transition-all hover:border-primary/40"
            >
              {/* Cabecera del Bloque */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 px-2 items-center justify-center rounded-md bg-primary text-[11px] font-black text-white">
                      BLOQUE {indexBloque + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {bloque.items.length} {bloque.items.length === 1 ? 'ítem' : 'ítems'}
                    </span>
                  </div>

                  {bloques.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarBloque(bloque.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar esta sección completa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Eliminar Sección</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      Sección o Dimensión Principal <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={bloque.seccion}
                      onChange={(e) => actualizarBloque(bloque.id, { seccion: e.target.value })}
                      placeholder="Ej. I. CONDICIONES BÁSICAS PARA EL APRENDIZAJE"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Subcriterio o Eje Temático (Opcional)
                    </label>
                    <input
                      type="text"
                      value={bloque.subcriterio ?? ''}
                      onChange={(e) => actualizarBloque(bloque.id, { subcriterio: e.target.value })}
                      placeholder="Ej. 2.1. Interacciones pedagógicas en el aula"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Ítems del Bloque */}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Ítems de Verificación de este Bloque
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Escala: Sí | Parcialmente | No
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {bloque.items.map((item, indexItem) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50/80 transition-colors"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200/70 text-[11px] font-black text-slate-700 mt-1">
                        {indexItem + 1}
                      </span>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-8 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                            Enunciado del Ítem Observable <span className="text-destructive">*</span>
                          </label>
                          <textarea
                            value={item.texto}
                            onChange={(e) =>
                              actualizarItem(bloque.id, item.id, { texto: e.target.value })
                            }
                            placeholder="Ej. El aula presenta condiciones físicas: está limpia, ordenada y con buena iluminación..."
                            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none shadow-inner leading-relaxed"
                            rows={2}
                            required
                          />
                        </div>

                        <div className="md:col-span-4 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Evidencia / Foco Esperado (Opcional)
                          </label>
                          <textarea
                            value={item.foco ?? ''}
                            onChange={(e) =>
                              actualizarItem(bloque.id, item.id, { foco: e.target.value })
                            }
                            placeholder="Ej. Revisar la ventilación, letrados bilingües, etc..."
                            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 focus:ring-1 focus:ring-primary focus:outline-none shadow-inner leading-relaxed"
                            rows={2}
                          />
                        </div>
                      </div>

                      {bloque.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarItem(bloque.id, item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer mt-1"
                          aria-label="Eliminar ítem"
                          title="Eliminar ítem"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => agregarItem(bloque.id)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-primary/40 text-xs font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer mt-1 self-start"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar Ítem a esta Sección</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Botón para añadir una nueva sección */}
        <button
          type="button"
          onClick={agregarBloque}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-xs font-black text-primary hover:bg-primary/10 transition-colors cursor-pointer shadow-xs"
        >
          <FolderPlus className="h-4 w-4" />
          <span>+ Agregar Nueva Sección o Dimensión EIB</span>
        </button>
      </div>
    </SectionCard>
  );
};
