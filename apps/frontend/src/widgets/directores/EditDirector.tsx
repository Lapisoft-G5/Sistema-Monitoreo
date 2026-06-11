import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Building2, Pencil, Clock, Save } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { MOCK_DOCENTES } from '@entities/model-docentes';
import { MOCK_INSTITUCIONES } from '@entities/model-instituciones';
import { Card } from '@shared/ui/card';
import { Avatar, AvatarFallback } from '@shared/ui/avatar';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { SectionCard, TextField, SelectField, twoCols } from '@shared/ui/form-controls';

const NIVELES_DISPLAY = ['INICIAL', 'PRIMARIA', 'SECUNDARIA'] as const;
const nivelLabel = (n: string) => n.charAt(0) + n.slice(1).toLowerCase();

export const EditDirectorCard = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const director = MOCK_DOCENTES.find((d) => d.id === id && d.cargo === 'Director');

  const [form, setForm] = useState(() => ({
    nombres: director?.nombres ?? '',
    apellidos: director?.apellidos ?? '',
    correo: director?.correo ?? '',
    celular: director?.celular ?? '',
    institucionId: director?.institucionId ?? '',
  }));

  if (!director) {
    return (
      <div className="p-6 text-center text-text-muted font-medium bg-surface border border-border rounded-2xl">
        No se encontró el director especificado.
      </div>
    );
  }

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // IEs ofrecidas: las sin director + la que ya tiene este director (su actual).
  const iesDisponibles = MOCK_INSTITUCIONES.filter(
    (i) => !i.director || i.id === director.institucionId,
  );
  const ieActual = MOCK_INSTITUCIONES.find((i) => i.id === form.institucionId);
  const nivelActual = ieActual?.nivel ?? director.nivelEducativo;

  const aniosGestion = Math.max(
    0,
    new Date().getFullYear() - new Date(director.fechaCreacion).getFullYear(),
  );

  const handleSubmit = () => {
    const idx = MOCK_DOCENTES.findIndex((d) => d.id === id);
    if (idx === -1) return;
    MOCK_DOCENTES[idx] = {
      ...MOCK_DOCENTES[idx],
      nombres: form.nombres,
      apellidos: form.apellidos,
      correo: form.correo,
      celular: form.celular,
      institucionId: form.institucionId,
      nivelEducativo: nivelActual, // el nivel sigue al de la I.E.
    };
    navigate('/instituciones/docentes');
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in-0 duration-300">
      {/* Banner (color del tema, antes azul) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Pencil className="w-4 h-4" />
          Editando información del director: DNI {director.dni}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="w-3.5 h-3.5" />
          Última modificación: {new Date(director.fechaCreacion).toLocaleDateString('es-PE')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <SectionCard icon={<User className="w-5 h-5" />} title="Datos Personales">
            <div style={twoCols}>
              <TextField label="Nombres" required value={form.nombres} onChange={(v) => set('nombres', v)} placeholder="Ej. Elena" />
              <TextField label="Apellidos" required value={form.apellidos} onChange={(v) => set('apellidos', v)} placeholder="Ej. Quispe Mamani" />
            </div>
            <div style={{ ...twoCols, marginTop: 18 }}>
              <TextField label="Número de DNI" value={director.dni} onChange={() => undefined} disabled />
              <TextField
                label="Teléfono de Contacto"
                required
                value={form.celular}
                onChange={(v) => set('celular', v.replace(/\D/g, '').slice(0, 9))}
                placeholder="999 999 999"
              />
            </div>
            <div style={{ marginTop: 18, maxWidth: 'calc(50% - 9px)', minWidth: 240 }}>
              <TextField label="Correo Institucional" required value={form.correo} onChange={(v) => set('correo', v)} placeholder="usuario@ugel.edu.pe" />
            </div>
          </SectionCard>

          <SectionCard icon={<Building2 className="w-5 h-5" />} title="Asignación Institucional">
            <div style={twoCols}>
              <SelectField
                label="Institución Educativa"
                required
                value={form.institucionId}
                onChange={(v) => set('institucionId', v)}
                options={iesDisponibles.map((i) => ({ value: i.id, label: i.nombre }))}
                placeholder="Seleccione la I.E."
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text">Nivel Educativo</label>
                <div className="flex gap-1.5 mt-1">
                  {NIVELES_DISPLAY.map((n) => (
                    <div
                      key={n}
                      className={cn(
                        'flex-1 text-center text-xs font-semibold py-2 rounded-lg border',
                        nivelActual === n
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-text-muted',
                      )}
                    >
                      {nivelLabel(n)}
                    </div>
                  ))}
                </div>
                <span className="text-[0.68rem] text-text-muted mt-1">Se toma del nivel de la I.E.</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Perfil (1/3) */}
        <div className="flex flex-col gap-5">
          <Card className="border border-border shadow-xs overflow-hidden p-0">
            <div className="bg-primary h-20" />
            <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center">
              <Avatar className="size-20 ring-4 ring-surface">
                <AvatarFallback className="bg-primary-light text-primary text-xl font-bold">
                  {director.nombres[0]}
                  {director.apellidos[0]}
                </AvatarFallback>
              </Avatar>
              <div className="mt-3 font-bold text-text">
                {director.nombres} {director.apellidos}
              </div>
              <div className="text-xs text-text-muted">Director {director.condicion}</div>
              {director.activo && (
                <Badge className="mt-2 bg-green-500/15 text-green-600 border-0 text-[0.65rem] font-bold uppercase">
                  ● Vigente / Activo
                </Badge>
              )}
              <div className="w-full border-t border-border mt-4 pt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Años en Gestión</span>
                  <span className="font-bold text-text">{aniosGestion} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Expedientes</span>
                  <span className="font-bold text-text">—</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-border shadow-xs p-5">
            <div className="text-[0.7rem] font-bold uppercase tracking-wider text-text-muted mb-3">
              Acciones de Registro
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 font-bold bg-primary hover:bg-primary-hover text-white cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Actualizar Datos
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
