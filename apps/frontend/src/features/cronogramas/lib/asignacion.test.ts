import { describe, it, expect } from 'vitest';
import { RoleCode } from '@sistema-monitoreo/shared-contracts';
import {
  especialistasAsignables,
  institucionesAsignables,
  modalidadesPermitidas,
  nivelesPermitidos,
  tiposPermitidosDelMonitor,
  docenteEvaluablePorEspecialista,
  especialidadesDelDocente,
  type EspecialistaAsignable,
  type InstitucionAsignable,
  type UsuarioAsignador,
} from './asignacion';

/**
 * Pruebas de la cascada de asignación de un cronograma.
 *
 * Fase 5 de PLAN_REMEDIACION.md. Estas cuatro reglas vivían como `useMemo`
 * dentro de `CronogramaPage`, un componente de 1.446 líneas. Deciden quién
 * puede monitorear qué: a qué modalidades accede el usuario, qué niveles ofrece
 * cada modalidad, qué especialistas pueden asignarse y a qué instituciones.
 * Ninguna tenía cobertura.
 */

const usuario = (over: Partial<UsuarioAsignador> = {}): UsuarioAsignador => ({
  role: RoleCode.JEFE_GESTION,
  ...over,
});

const especialista = (over: Partial<EspecialistaAsignable> = {}): EspecialistaAsignable => ({
  id: 'esp-1',
  cargo: 'Especialista',
  activo: true,
  nivelEducativo: 'Primaria',
  modalidad: 'EBR',
  ...over,
});

const institucion = (over: Partial<InstitucionAsignable> = {}): InstitucionAsignable => ({
  id: 'ie-1',
  modalidad: 'EBR',
  nivelEducativo: 'Primaria',
  estado: 'Activa',
  ...over,
});

describe('modalidadesPermitidas', () => {
  it('el jefe de gestión accede a todas', () => {
    expect(modalidadesPermitidas(usuario()).length).toBeGreaterThan(1);
  });

  it('sin usuario devuelve todas', () => {
    expect(modalidadesPermitidas(null).length).toBeGreaterThan(1);
  });

  it('un jefe de área sin nivel asignado no queda restringido', () => {
    const actor = usuario({ role: RoleCode.JEFE_AREA, especialistaNivel: undefined });
    expect(modalidadesPermitidas(actor).length).toBeGreaterThan(1);
  });

  it.each([
    ['Inicial', ['EBE', 'EBR']],
    ['Primaria', ['EBR']],
    ['Secundaria', ['CEPTRO', 'EBA', 'EBR']],
  ])('el jefe de área de %s accede a %s', (nivel, esperadas) => {
    const actor = usuario({ role: RoleCode.JEFE_AREA, especialistaNivel: nivel });
    expect([...modalidadesPermitidas(actor)].sort()).toEqual(esperadas);
  });
});

describe('nivelesPermitidos', () => {
  it('sin modalidad no ofrece niveles', () => {
    expect(nivelesPermitidos('', usuario())).toEqual([]);
  });

  it('ofrece los niveles de la modalidad', () => {
    expect(nivelesPermitidos('EBR', usuario()).length).toBeGreaterThan(0);
  });

  it('una modalidad desconocida no ofrece niveles', () => {
    expect(nivelesPermitidos('INEXISTENTE', usuario())).toEqual([]);
  });

  it('el jefe de área sólo ve su propio nivel dentro de EBR', () => {
    const actor = usuario({ role: RoleCode.JEFE_AREA, especialistaNivel: 'Primaria' });
    expect(nivelesPermitidos('EBR', actor)).toEqual(['Primaria']);
  });

  /**
   * La restricción por nivel se aplica sólo a EBR. Las otras modalidades tienen
   * su propia estructura de niveles y no se corresponden una a una con la de
   * educación básica regular.
   */
  it('el jefe de área no queda restringido fuera de EBR', () => {
    const actor = usuario({ role: RoleCode.JEFE_AREA, especialistaNivel: 'Primaria' });
    expect(nivelesPermitidos('EBA', actor)).toEqual(nivelesPermitidos('EBA', usuario()));
  });
});

describe('especialistasAsignables — sin cascada completa', () => {
  it('no ofrece nadie sin modalidad', () => {
    expect(especialistasAsignables([especialista()], '', 'Primaria')).toEqual([]);
  });

  it('no ofrece nadie sin nivel', () => {
    expect(especialistasAsignables([especialista()], 'EBR', '')).toEqual([]);
  });
});

describe('especialistasAsignables — EBR', () => {
  const asignables = (esp: EspecialistaAsignable[]) =>
    especialistasAsignables(esp, 'EBR', 'Primaria').map((e) => e.id);

  it('ofrece al especialista de la misma modalidad y nivel', () => {
    expect(asignables([especialista({ id: 'ok' })])).toEqual(['ok']);
  });

  it('descarta al de otro nivel', () => {
    expect(asignables([especialista({ id: 'x', nivelEducativo: 'Secundaria' })])).toEqual([]);
  });

  it('descarta al de otra modalidad', () => {
    expect(asignables([especialista({ id: 'x', modalidad: 'EBA' })])).toEqual([]);
  });

  /** EBR es la modalidad principal de la UGEL y se asume cuando falta el dato. */
  it('asume EBR cuando el especialista no declara modalidad', () => {
    expect(asignables([especialista({ id: 'ok', modalidad: undefined })])).toEqual(['ok']);
  });

  it('descarta al inactivo', () => {
    expect(asignables([especialista({ id: 'x', activo: false })])).toEqual([]);
  });

  it('descarta cargos que no monitorean', () => {
    expect(asignables([especialista({ id: 'x', cargo: 'Director' })])).toEqual([]);
  });
});

describe('especialistasAsignables — jefe de gestión', () => {
  /** El Jefe de Gestión monitorea a los directores de las instituciones. */
  it('queda entre los asignables', () => {
    const jefe = especialista({ id: 'jefe-1', cargo: 'Jefe de Gestión' });
    const resultado = especialistasAsignables([jefe], 'EBR', 'Primaria');
    expect(resultado.map((e) => e.id)).toEqual(['jefe-1']);
  });

  /**
   * No cubre un nivel: es de toda la UGEL. Su registro de especialista trae un
   * nivel y una modalidad, pero exigírselos lo dejaría fuera de casi todas las
   * visitas.
   */
  it('se ofrece en cualquier nivel y modalidad, sin importar los de su registro', () => {
    const jefe = especialista({
      id: 'jefe-1',
      cargo: 'Jefe de Gestión',
      nivelEducativo: 'Secundaria',
      modalidad: 'EBA',
    });

    for (const [modalidad, nivel] of [
      ['EBR', 'Primaria'],
      ['EBR', 'Inicial'],
      ['EBE', 'CEBE'],
      ['CEPTRO', 'Técnico Productiva'],
    ]) {
      expect(especialistasAsignables([jefe], modalidad, nivel).map((e) => e.id)).toEqual(['jefe-1']);
    }
  });

  it('sin modalidad o nivel elegidos no se ofrece nada, como a cualquiera', () => {
    const jefe = especialista({ id: 'jefe-1', cargo: 'Jefe de Gestión' });
    expect(especialistasAsignables([jefe], '', '')).toEqual([]);
  });

  it('inactivo no se ofrece', () => {
    const jefe = especialista({ id: 'jefe-1', cargo: 'Jefe de Gestión', activo: false });
    expect(especialistasAsignables([jefe], 'EBR', 'Primaria')).toEqual([]);
  });

  it('el Director de UGEL sigue sin ofrecerse', () => {
    const director = especialista({
      id: 'dir-ugel',
      cargo: 'Jefe de Gestión',
      rolCode: 'director_ugel',
    });
    expect(especialistasAsignables([director], 'EBR', 'Primaria')).toEqual([]);
  });
});

/**
 * Qué ficha puede levantar el monitor elegido. El formulario elige primero al
 * monitor y después el tipo de ficha, así que es el monitor quien lo acota.
 */
describe('tiposPermitidosDelMonitor', () => {
  it('el Jefe de Gestión sólo levanta la ficha directiva', () => {
    expect(tiposPermitidosDelMonitor('Jefe de Gestión')).toEqual(['DIRECTIVO']);
  });

  it('el Responsable de Nivel levanta las dos', () => {
    expect(tiposPermitidosDelMonitor('Jefe de Área')).toEqual(['DOCENTE', 'DIRECTIVO']);
  });

  it('el especialista levanta las dos', () => {
    expect(tiposPermitidosDelMonitor('Especialista')).toEqual(['DOCENTE', 'DIRECTIVO']);
  });

  /** Mientras no hay monitor elegido no hay nada que restringir. */
  it('sin monitor elegido no restringe', () => {
    expect(tiposPermitidosDelMonitor(undefined)).toEqual(['DOCENTE', 'DIRECTIVO']);
  });
});

describe('especialistasAsignables — jefe de área', () => {
  it('el jefe de área queda entre los asignables: también sale a monitorear', () => {
    const resultado = especialistasAsignables(
      [especialista({ id: 'jefe-area-1', cargo: 'Jefe de Área' })],
      'EBR',
      'Primaria',
    );
    expect(resultado.map((e) => e.id)).toEqual(['jefe-area-1']);
  });

  /**
   * Sin excepciones por quién arma el cronograma: un Responsable de Nivel de
   * otro nivel u otra modalidad queda fuera igual que cualquier especialista.
   */
  it('el de otro nivel u otra modalidad queda fuera, sin importar quién arme el cronograma', () => {
    const deOtroNivel = especialista({
      id: 'jefe-area-secundaria',
      cargo: 'Jefe de Área',
      nivelEducativo: 'Secundaria',
      modalidad: 'EBA',
    });
    const resultado = especialistasAsignables([deOtroNivel], 'EBR', 'Primaria');
    expect(resultado).toEqual([]);
  });

  it('reconoce el cargo "Responsable de Nivel" y variantes sin tilde', () => {
    const responsable = especialista({
      id: 'resp-1',
      cargo: 'Responsable de Nivel',
      nivelEducativo: 'Primaria',
      modalidad: 'EBR',
    });
    const jefeSinTilde = especialista({
      id: 'jefe-sin-tilde',
      cargo: 'Jefe de Area',
      nivelEducativo: 'Primaria',
      modalidad: 'EBR',
    });
    const resultado = especialistasAsignables([responsable, jefeSinTilde], 'EBR', 'Primaria');
    expect(resultado.map((e) => e.id).sort()).toEqual(['jefe-sin-tilde', 'resp-1']);
  });

  it('tolera diferencias de mayúsculas, minúsculas y espacios en modalidad y nivel', () => {
    const espMayus = especialista({
      id: 'esp-mayus',
      cargo: 'ESPECIALISTA',
      nivelEducativo: 'SECUNDARIA',
      modalidad: 'EBR ',
    });
    const resultado = especialistasAsignables([espMayus], 'ebr', 'secundaria');
    expect(resultado.map((e) => e.id)).toEqual(['esp-mayus']);
  });
});

describe('especialistasAsignables — monitor ya asignado, al editar', () => {
  /**
   * Una regla de elegibilidad cambia después de creada la visita —acá, que el
   * Responsable de Nivel pasa a cubrir otro nivel— y el monitor que ya estaba
   * asignado no pasa el filtro. Sin conservarlo, el selector se abría vacío en
   * modo edición: la opción elegida desaparecía de la lista.
   */
  const deOtroNivel = () =>
    especialista({ id: 'jefe-area-1', cargo: 'Jefe de Área', nivelEducativo: 'Secundaria' });

  it('conserva al monitor ya asignado aunque ya no sea elegible', () => {
    const resultado = especialistasAsignables([deOtroNivel()], 'EBR', 'Primaria', 'jefe-area-1');
    expect(resultado.map((e) => e.id)).toEqual(['jefe-area-1']);
  });

  it('no lo duplica si de todos modos sigue siendo elegible', () => {
    const resultado = especialistasAsignables(
      [especialista({ id: 'esp-1' })],
      'EBR',
      'Primaria',
      'esp-1',
    );
    expect(resultado.map((e) => e.id)).toEqual(['esp-1']);
  });

  it('sin id de monitor actual, no agrega nada de más', () => {
    const resultado = especialistasAsignables([deOtroNivel()], 'EBR', 'Primaria', null);
    expect(resultado).toEqual([]);
  });
});

describe('especialistasAsignables — CEPTRO', () => {
  const asignables = (esp: EspecialistaAsignable[]) =>
    especialistasAsignables(esp, 'CEPTRO', 'Secundaria').map((e) => e.id);

  /**
   * CEPTRO es educación técnico-productiva: exige un especialista de Secundaria
   * con la especialidad EPT, sin importar de qué modalidad venga.
   */
  it('exige Secundaria con especialidad EPT', () => {
    const apto = especialista({
      id: 'ok',
      nivelEducativo: 'Secundaria',
      especialidades: ['EPT'],
      modalidad: 'EBR',
    });
    expect(asignables([apto])).toEqual(['ok']);
  });

  it('descarta a quien no tiene EPT', () => {
    const sinEpt = especialista({ id: 'x', nivelEducativo: 'Secundaria', especialidades: ['CTA'] });
    expect(asignables([sinEpt])).toEqual([]);
  });

  it('descarta a quien no es de Secundaria aunque tenga EPT', () => {
    const primaria = especialista({ id: 'x', nivelEducativo: 'Primaria', especialidades: ['EPT'] });
    expect(asignables([primaria])).toEqual([]);
  });

  it('ignora la modalidad de origen del especialista', () => {
    const deOtraModalidad = especialista({
      id: 'ok',
      modalidad: 'EBA',
      nivelEducativo: 'Secundaria',
      especialidades: ['EPT'],
    });
    expect(asignables([deOtraModalidad])).toEqual(['ok']);
  });
});

describe('especialistasAsignables — EBA y EBE', () => {
  /**
   * EBA y EBE se cubren con especialistas de Inicial o Primaria, con
   * independencia del nivel que pida el cronograma.
   */
  it.each(['EBA', 'EBE'])('%s admite especialistas de Inicial o Primaria', (modalidad) => {
    const inicial = especialista({ id: 'ini', nivelEducativo: 'Inicial' });
    const primaria = especialista({ id: 'pri', nivelEducativo: 'Primaria' });
    const secundaria = especialista({ id: 'sec', nivelEducativo: 'Secundaria' });

    const resultado = especialistasAsignables([inicial, primaria, secundaria], modalidad, 'Secundaria');

    expect(resultado.map((e) => e.id).sort()).toEqual(['ini', 'pri']);
  });
});

describe('institucionesAsignables', () => {
  it('no ofrece nada sin modalidad o sin nivel', () => {
    expect(institucionesAsignables([institucion()], '', 'Primaria')).toEqual([]);
    expect(institucionesAsignables([institucion()], 'EBR', '')).toEqual([]);
  });

  it('ofrece la institución que coincide en modalidad y nivel', () => {
    const resultado = institucionesAsignables([institucion({ id: 'ok' })], 'EBR', 'Primaria');
    expect(resultado.map((i) => i.id)).toEqual(['ok']);
  });

  it('descarta la de otra modalidad o de otro nivel', () => {
    expect(institucionesAsignables([institucion({ modalidad: 'EBA' })], 'EBR', 'Primaria')).toEqual([]);
    expect(
      institucionesAsignables([institucion({ nivelEducativo: 'Inicial' })], 'EBR', 'Primaria'),
    ).toEqual([]);
  });

  it('descarta la institución cerrada', () => {
    const cerrada = institucion({ estado: 'Inactiva', activo: false });
    expect(institucionesAsignables([cerrada], 'EBR', 'Primaria')).toEqual([]);
  });

  /** Conviven dos formas de marcar vigencia; basta con una de las dos. */
  it('admite la institución activa por cualquiera de las dos marcas', () => {
    const porEstado = institucion({ id: 'a', estado: 'Activa', activo: false });
    const porBandera = institucion({ id: 'b', estado: 'Inactiva', activo: true });

    const resultado = institucionesAsignables([porEstado, porBandera], 'EBR', 'Primaria');
    expect(resultado.map((i) => i.id).sort()).toEqual(['a', 'b']);
  });

  it('tolera diferencias de mayúsculas y espacios en modalidad, nivel y estado', () => {
    const ieConEspacios = institucion({
      id: 'ie-espacios',
      modalidad: 'ebr',
      nivelEducativo: 'PRIMARIA ',
      estado: 'activa',
    });
    const resultado = institucionesAsignables([ieConEspacios], 'EBR', 'Primaria');
    expect(resultado.map((i) => i.id)).toEqual(['ie-espacios']);
  });
});

describe('especialidadesDelDocente', () => {
  it('separa una lista por comas y descarta vacíos', () => {
    expect(especialidadesDelDocente('Matematica, Comunicacion')).toEqual([
      'Matematica',
      'Comunicacion',
    ]);
    expect(especialidadesDelDocente('  ')).toEqual([]);
    expect(especialidadesDelDocente(null)).toEqual([]);
  });
});

describe('docenteEvaluablePorEspecialista', () => {
  it('fuera de Secundaria evalúa a cualquier docente', () => {
    expect(docenteEvaluablePorEspecialista('Comunicacion', ['Matematica'], false)).toBe(true);
  });

  it('en Secundaria exige compartir área', () => {
    expect(docenteEvaluablePorEspecialista('Comunicacion', ['Matematica'], true)).toBe(false);
    expect(
      docenteEvaluablePorEspecialista('Comunicacion', ['Matematica', 'Comunicacion'], true),
    ).toBe(true);
  });

  it('compara sin tildes ni mayúsculas', () => {
    expect(docenteEvaluablePorEspecialista('COMUNICACION', ['Comunicación'], true)).toBe(true);
  });

  it('en Secundaria, sin especialidades del especialista no ofrece a nadie', () => {
    expect(docenteEvaluablePorEspecialista('Matematica', [], true)).toBe(false);
  });

  it('en Secundaria, admite al docente si comparte una de sus especialidades extras', () => {
    expect(
      docenteEvaluablePorEspecialista('Matematica', ['Fisica'], true, ['Fisica', 'Quimica']),
    ).toBe(true);
    expect(
      docenteEvaluablePorEspecialista('Matematica', ['Arte'], true, ['Fisica', 'Quimica']),
    ).toBe(false);
  });
});

