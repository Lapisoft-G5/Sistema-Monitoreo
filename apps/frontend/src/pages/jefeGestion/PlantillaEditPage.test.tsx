import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Plantilla } from '@entities/model-plantillas/model';

/**
 * Editar una plantilla: qué llega al servidor al guardar.
 *
 * El formulario ofrece «Nombre de la ficha» —con qué nombre aparece en el
 * catálogo— pero la pantalla no lo enviaba: se editaba, el guardado decía que
 * había salido bien y la tarjeta seguía con el nombre de antes. El servidor sí
 * lo guarda cuando se le manda; lo que se fija acá es que la pantalla se lo manda.
 */

const { navegar, actualizar, estadoPlantilla } = vi.hoisted(() => ({
  navegar: vi.fn(),
  actualizar: { mutateAsync: vi.fn(), isPending: false },
  estadoPlantilla: { data: undefined as unknown },
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'p-1' }),
  useNavigate: () => navegar,
}));

vi.mock('@entities/model-plantillas/use-plantillas-api', () => ({
  usePlantilla: () => ({
    data: estadoPlantilla.data,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useActualizarPlantilla: () => actualizar,
}));

vi.mock('@entities/model-user', () => ({
  useUser: () => ({ user: { role: 'jefe_gestion' }, isAuthenticated: true }),
}));

vi.mock('@entities/model-lemas', () => ({
  lemasApi: { upsert: vi.fn() },
  useLemaDelAnio: () => ({ data: { lema: 'Año de prueba' }, isLoading: false }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() } }));

const { PlantillaEditPage } = await import('./PlantillaEditPage');

const NOMBRE_INICIAL = 'Ficha oficial UGEL para evaluacion directivo 2026 (seed).';

const plantilla = (over: Partial<Plantilla> = {}): Plantilla =>
  ({
    id: 'p-1',
    tipoMonitoreo: 'Monitoreo Directivo',
    instrumento: 'DIRECTIVO',
    descripcion: NOMBRE_INICIAL,
    anioAcademico: 2026,
    lema: 'Año de prueba',
    baremo: 'Vigente',
    niveles: [
      { nivel: 'I', denominacion: 'Muy Insatisfactorio', rangoMin: 0, color: '#ef4444' },
      { nivel: 'II', denominacion: 'En Proceso', rangoMin: 11, color: '#f59e0b' },
      { nivel: 'III', denominacion: 'Satisfactorio', rangoMin: 15, color: '#22c55e' },
      { nivel: 'IV', denominacion: 'Destacado', rangoMin: 18, color: '#3b82f6' },
    ],
    desempenos: [
      {
        id: 'd-1',
        nombre: 'Gestión de los aprendizajes',
        descripcionCorta: 'Condiciones básicas',
        preguntaExtra: '',
        aspectos: [{ id: 'a-1', descripcion: 'Planifica con anticipación' }],
        rubrica: [
          { nivel: 'I', descripcion: 'No cumple' },
          { nivel: 'II', descripcion: 'Cumple en parte' },
          { nivel: 'III', descripcion: 'Cumple' },
          { nivel: 'IV', descripcion: 'Supera' },
        ],
      },
    ],
    ejesItems: [],
    ...over,
  }) as Plantilla;

const montar = (over: Partial<Plantilla> = {}) => {
  estadoPlantilla.data = plantilla(over);
  render(<PlantillaEditPage />);
  return userEvent.setup();
};

const campoNombre = () => screen.getByPlaceholderText(/Observación del taller de carpintería/);

const guardar = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Modificar Plantilla' }));
  await waitFor(() => expect(actualizar.mutateAsync).toHaveBeenCalledTimes(1));
  return actualizar.mutateAsync.mock.calls[0][0] as {
    id: string;
    data: Record<string, unknown>;
  };
};

describe('PlantillaEditPage — el nombre de la ficha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actualizar.mutateAsync.mockResolvedValue({ modo: 'IN_PLACE', mensaje: 'Guardado.' });
  });

  it('muestra el nombre que la plantilla tiene guardado', () => {
    montar();

    expect(campoNombre()).toHaveValue(NOMBRE_INICIAL);
  });

  it('manda al guardar el nombre que se escribió', async () => {
    const user = montar();

    await user.clear(campoNombre());
    await user.type(campoNombre(), 'Ficha directiva del taller');
    const { data } = await guardar(user);

    expect(data.descripcion).toBe('Ficha directiva del taller');
  });

  it('manda el nombre sin los espacios de los bordes', async () => {
    const user = montar();

    await user.clear(campoNombre());
    await user.type(campoNombre(), '   Ficha con espacios   ');
    const { data } = await guardar(user);

    expect(data.descripcion).toBe('Ficha con espacios');
  });

  /** Borrar el nombre es una decisión: tiene que poder guardarse, no volver al de antes. */
  it('manda el nombre vacío cuando se lo borró', async () => {
    const user = montar();

    await user.clear(campoNombre());
    const { data } = await guardar(user);

    expect(data.descripcion).toBe('');
  });

  /**
   * Una copia guarda «Copia basada en …» en este mismo campo, y es el único
   * rastro de qué versión desciende. Si no se tocó, no se reescribe.
   */
  it('no manda el nombre si no se lo tocó', async () => {
    const user = montar();

    const { data } = await guardar(user);

    expect(data).not.toHaveProperty('descripcion');
  });

  it('no cuenta como cambio agregarle espacios al mismo nombre', async () => {
    const user = montar();

    await user.type(campoNombre(), '   ');
    const { data } = await guardar(user);

    expect(data).not.toHaveProperty('descripcion');
  });

  it('sigue mandando el resto de la plantilla junto con el nombre', async () => {
    const user = montar();

    await user.clear(campoNombre());
    await user.type(campoNombre(), 'Otro nombre');
    const { id, data } = await guardar(user);

    expect(id).toBe('p-1');
    expect(data).toEqual(
      expect.objectContaining({
        baremo: 'Vigente',
        niveles: expect.any(Array),
        desempenos: expect.any(Array),
      }),
    );
  });
});
