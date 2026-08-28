import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@shared/ui/card';
import { PageHeader } from '@shared/ui/pageHeader';
import { PlantillaForm, type PlantillaFormState } from '@widgets/plantillas';
import { plantillasApi } from '@entities/model-plantillas/api/plantillas.api';
import {
  descriptorPorDefecto,
  romanosDeInstrumento,
} from '@entities/model-plantillas/escala-por-defecto';
import {
  instrumentoDeRotulo,
  ROTULO_DE_INSTRUMENTO,
} from '@entities/model-plantillas/rotulo-de-instrumento';
import { useCuposDePlantilla } from '@features/solicitudes-plantilla';
import { useUser } from '@entities/model-user';
import { RoleCode } from '@sistema-monitoreo/shared-contracts';

/** Roles cuya plantilla pertenece a una institución educativa. */
const ROLES_DE_INSTITUCION: readonly RoleCode[] = [
  RoleCode.DIRECTOR_INSTITUCION,
  RoleCode.COORDINADOR_PEDAGOGICO,
  RoleCode.JEFE_TALLER,
];
import { lemasApi } from '@entities/model-lemas';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmModal } from '@shared/ui/ConfirmModal';

import type { TipoPlantilla } from '@sistema-monitoreo/shared-contracts';

export const PlantillaCreatePage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useUser();
  const esDeInstitucion = ROLES_DE_INSTITUCION.includes(user?.role as RoleCode);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Instrumentos que esta persona puede registrar.
   *
   * Para la UGEL, todos. Para una institución, sólo los que tenga autorizados
   * por una solicitud aprobada y sin usar. Antes el selector se fijaba a
   * «Monitoreo Docente» a mano para el director y quedaba deshabilitado: no
   * podía registrar una ficha EIB ni teniéndola aprobada.
   *
   * `undefined` significa «sin restricción» y lo resuelve la cabecera según el
   * rol; una lista vacía significa «no tiene ninguna autorizada».
   */
  const { data: cupos = [] } = useCuposDePlantilla(new Date().getFullYear());
  const instrumentosPermitidos = useMemo(() => {
    if (!esDeInstitucion) return undefined;
    return [...new Set(cupos.map((c) => ROTULO_DE_INSTRUMENTO[c.instrumento]))];
  }, [esDeInstitucion, cupos]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingArchive, setPendingArchive] = useState<{ plantillas: { id: string; anioAcademico: number; tipoMonitoreo: string }[]; data: PlantillaFormState; backendTipo: TipoPlantilla } | null>(null);

  const handleSubmit = async (data: PlantillaFormState) => {
    setIsSaving(true);
    setSubmitError(null);

    const backendTipo = instrumentoDeRotulo(data.tipoMonitoreo);

    try {
      const existing = await plantillasApi.findAll({
        tipoMonitoreo: backendTipo,
        anioAcademico: Number(data.anioAcademico),
        estado: 'Vigente',
      });
      if (existing && existing.length > 0) {
        setPendingArchive({
          plantillas: existing.map((p) => ({ id: p.id, anioAcademico: p.anioAcademico, tipoMonitoreo: p.tipoMonitoreo })),
          data,
          backendTipo,
        });
        setIsSaving(false);
        return;
      }

      await executeCreate(data, backendTipo, []);
    } catch (err) {
      console.error('[plantilla] Error al crear:', err);
      let msg = err instanceof Error ? err.message : 'Error desconocido';
      if (msg.includes('should not be empty')) {
        msg = msg
          .replace(/desempenos\.(\d+)\.rubrica\.(\d+)\.descripcion/g, (_m, d, r) => `Desempeño ${Number(d) + 1} - Rúbrica ${Number(r) + 1}`)
          .replace(/desempenos\.(\d+)\.aspectos\.(\d+)\.descripcion/g, (_m, d, a) => `Desempeño ${Number(d) + 1} - Aspecto ${Number(a) + 1}`)
          .replace(/desempenos\.(\d+)\.nombre/g, (_m, d) => `Desempeño ${Number(d) + 1} (Nombre)`)
          .replace(/ should not be empty/g, ': No debe estar vacío.')
          .split(',')
          .join('\n');
      }
      setSubmitError(msg);
      setIsSaving(false);
    }
  };

  const executeCreate = async (data: PlantillaFormState, backendTipo: TipoPlantilla, toArchive: { id: string }[]) => {
    try {
      // El lema va primero: la plantilla lo devuelve ya resuelto por su año, de
      // modo que crearla antes la dejaría con el encabezado en blanco hasta la
      // próxima recarga.
      await lemasApi.upsert(Number(data.anioAcademico), data.lema);

      for (const old of toArchive) {
        await plantillasApi.cambiarEstado(old.id, 'Historico');
      }

      const created = await plantillasApi.create({
        tipoMonitoreo: backendTipo,
        anioAcademico: Number(data.anioAcademico),
        baremo: data.baremo,
        // El nombre que puso quien la crea. Antes acá se fabricaba una
        // descripción con la fecha y la cantidad de desempeños, que repetía dos
        // filas que la tarjeta ya muestra; ahora lleva lo único que la tarjeta
        // no puede deducir: con qué nombre la distingue la institución.
        descripcion: data.descripcion.trim() || undefined,
        niveles: data.niveles.map((n, i) => ({
          nivelRomano: n.nivel,
          denominacion: n.denominacion,
          rangoMin: n.rangoMin,
          color: n.color,
          orden: i + 1,
        })),
        desempenos: data.desempenos
          .map((d, i) => ({
            id: d.id,
            nombre: d.nombre,
            descripcionCorta: d.descripcionCorta,
            preguntaExtra: d.preguntaExtra || undefined,
            orden: i + 1,
            aspectos: (d.aspectos ?? [])
              .filter((a) => a && a.descripcion && a.descripcion.trim() !== '')
              .map((a, ai) => ({
                id: a.id,
                descripcion: a.descripcion,
                orden: ai + 1,
              })),
            /**
             * La rúbrica lleva una entrada por nivel que el instrumento otorga.
             * Para la EIB son tres: antes se enviaba una cuarta que duplicaba
             * «Sí» porque `validarReglas` exigía cuatro para todos.
             */
            rubrica: romanosDeInstrumento(data.tipoMonitoreo).map((nivel) => {
              const declarada = d.rubrica?.find((r) => r.nivel === nivel);
              return {
                nivelRomano: nivel,
                descripcion:
                  declarada?.descripcion?.trim() || descriptorPorDefecto(data.tipoMonitoreo, nivel),
              };
            }),
          })),
        ejeItems: (data.ejeItems ?? []).map((item) => ({
          numero: item.numero,
          descripcion: item.descripcion,
        })),
      });

      await plantillasApi.cambiarEstado(created.id, 'Vigente');

      qc.invalidateQueries({ queryKey: ['plantillas'] });
      qc.invalidateQueries({ queryKey: ['lema-anual'] });

      setPendingArchive(null);
      setIsSaving(false);
      navigate(-1);
    } catch (err) {
      console.error('[plantilla] Error al crear:', err);
      let msg = err instanceof Error ? err.message : 'Error desconocido';
      if (msg.includes('should not be empty')) {
        msg = msg
          .replace(/desempenos\.(\d+)\.rubrica\.(\d+)\.descripcion/g, (_m, d, r) => `Desempeño ${Number(d) + 1} - Rúbrica ${Number(r) + 1}`)
          .replace(/desempenos\.(\d+)\.aspectos\.(\d+)\.descripcion/g, (_m, d, a) => `Desempeño ${Number(d) + 1} - Aspecto ${Number(a) + 1}`)
          .replace(/desempenos\.(\d+)\.nombre/g, (_m, d) => `Desempeño ${Number(d) + 1} (Nombre)`)
          .replace(/ should not be empty/g, ': No debe estar vacío.')
          .split(',')
          .join('\n');
      }
      setSubmitError(msg);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto w-full animate-in fade-in-0 duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer shadow-sm animate-in zoom-in-95 duration-200"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </button>
        <div className="flex-1">
          <PageHeader
            title="Registrar Nueva Plantilla"
            description="Complete los campos para dar de alta una plantilla de ficha de monitoreo."
          />
        </div>
      </div>

      {submitError && (
        <div className="border border-rose-200 bg-rose-50 text-rose-700 text-sm rounded-xl p-3 font-semibold whitespace-pre-wrap">
          {submitError}
        </div>
      )}

      {/*
        Sin autorizaciones el formulario no puede ofrecer ningún instrumento, y
        un selector vacío no explica nada. Se dice qué falta y quién lo tramita,
        en vez de dejar a la persona probando.
      */}
      {instrumentosPermitidos?.length === 0 ? (
        <Card className="p-8 flex flex-col items-center gap-3 text-center border-amber-200 bg-amber-50">
          <ClipboardList className="h-8 w-8 text-amber-700" />
          <p className="text-sm font-bold text-amber-900">
            Tu institución no tiene ninguna plantilla autorizada sin usar.
          </p>
          <p className="text-sm text-amber-900 max-w-xl">
            Las tres fichas oficiales de la UGEL están disponibles para monitorear sin ningún
            trámite. Para registrar una ficha propia, el director de la I.E. debe presentar una
            solicitud y esperar que la Jefatura de Gestión la apruebe.
          </p>
          <Link
            to="/plantillas/mis-solicitudes"
            className="text-sm font-bold text-primary hover:underline"
          >
            Ir a Mis Solicitudes →
          </Link>
        </Card>
      ) : (
      <PlantillaForm
        onCancel={() => navigate(-1)}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        instrumentosPermitidos={instrumentosPermitidos}
      />
      )}

      {pendingArchive && (
        <ConfirmModal
          title="Archivar plantilla vigente existente"
          message={
            <span className="text-xs text-slate-600 leading-relaxed block">
              Ya existe {pendingArchive.plantillas.length} plantilla(s) vigente(s) de tipo{' '}
              <strong>{pendingArchive.plantillas[0]?.tipoMonitoreo}</strong> para el año{' '}
              <strong>{pendingArchive.plantillas[0]?.anioAcademico}</strong>. Si continúa, la(s) plantilla(s)
              vigente(s) pasará(n) a estado <strong>Histórico</strong> y la nueva plantilla quedará como
              Vigente. ¿Desea continuar?
            </span>
          }
          confirmLabel="Sí, archivar y crear"
          cancelLabel="Cancelar"
          onConfirm={() => {
            if (pendingArchive) {
              setIsSaving(true);
              executeCreate(pendingArchive.data, pendingArchive.backendTipo, pendingArchive.plantillas);
            }
          }}
          onCancel={() => setPendingArchive(null)}
        />
      )}
    </div>
  );
};
