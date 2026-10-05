import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LlenarFichaPage } from './LlenarFichaPage';
import type { Cronograma } from '@entities/model-cronogramas';
import type { Plantilla } from '@entities/model-plantillas';

// Mock de LlenarFichaForm para verificar que recibe las props correctas
vi.mock('./LlenarFichaForm', () => ({
  LlenarFichaForm: ({
    visit,
    template,
  }: {
    visit: Cronograma;
    template: Plantilla;
  }) => (
    <div data-testid="llenar-ficha-form">
      <span>Visita: {visit.id}</span>
      <span>Plantilla: {template.id}</span>
      <span>Docente: {visit.docenteDirectivo}</span>
    </div>
  ),
}));

vi.mock('./MigracionPlantillaFicha', () => ({
  MigracionPlantillaFicha: () => null,
}));

vi.mock('@entities/model-user', () => ({
  useUser: () => ({
    user: { id: 'usr-1', personaId: 'per-1', role: 'ESPECIALISTA', institucion: 'inst-1' },
  }),
}));

vi.mock('@shared/auth', () => ({
  useScope: () => ({
    isMonitorCampo: true,
    isInstitution: false,
  }),
  useCan: () => () => true,
}));

vi.mock('../hooks/use-ficha-persistence', () => ({
  useFichaPersistence: () => ({
    guardarBorrador: vi.fn(),
    finalizar: vi.fn(),
    prepararFichaLlena: vi.fn(),
  }),
}));

describe('LlenarFichaPage', () => {
  let queryClient: QueryClient;

  const mockVisit: Cronograma = {
    id: 'v-100',
    fechaHora: '2026-10-10T08:00:00',
    especialista: 'Juan Pérez',
    especialistaInitials: 'JP',
    institucion: 'I.E. San Martín',
    docenteDirectivo: 'María López',
    tipo: 'DOCENTE',
    nroVisita: '01',
    estado: 'PROGRAMADO',
    modalidad: 'EBR',
    nivel: 'Primaria',
    monitorId: 'm-1',
    institucionId: 'i-1',
  };

  const mockTemplate: Plantilla = {
    id: 'tpl-200',
    tipoMonitoreo: 'Monitoreo Docente',
    instrumento: 'DOCENTE',
    anioAcademico: 2026,
    lema: null,
    baremo: 'Vigente',
    niveles: [],
    desempenos: [],
    version: 1,
    estado: 'Vigente',
    descripcion: 'Ficha Estándar Primaria',
    fechaCreacion: '2026-01-01',
    fechaActualizacion: '2026-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('abre la ficha inmediatamente si viene con location.state', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/monitoreo/ficha/v-100',
              state: { visit: mockVisit, template: mockTemplate },
            },
          ]}
        >
          <Routes>
            <Route path="/monitoreo/ficha/:visitaId" element={<LlenarFichaPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('llenar-ficha-form')).toBeInTheDocument();
    expect(screen.getByText('Visita: v-100')).toBeInTheDocument();
    expect(screen.getByText('Plantilla: tpl-200')).toBeInTheDocument();
    expect(screen.getByText('Docente: María López')).toBeInTheDocument();
  });

  it('se auto-recupera de la caché sin location.state (simulando F5 / recarga en campo sin conexión)', async () => {
    // Sembramos la caché con los datos de cronogramas y plantillas
    queryClient.setQueryData(['cronogramas'], [
      {
        id: 'v-100',
        fechaProgramada: '2026-10-10',
        horaInicio: '08:00',
        monitorId: 'm-1',
        evaluadoId: 'e-1',
        institucionId: 'i-1',
        tipoMonitoreo: 'DOCENTE',
        numeroVisita: 1,
        estado: 'PENDIENTE',
        modalidad: 'EBR',
        nivelEducativo: 'Primaria',
      },
    ]);
    queryClient.setQueryData(['especialistas-lite'], {
      ok: true,
      data: [
        {
          id: 'm-1',
          personaId: 'p-1',
          persona: { nombres: 'Juan', apellidos: 'Pérez', dni: '123' },
          modalidad: 'EBR',
          nivelEducativo: 'Primaria',
          cargo: 'Especialista',
          activo: true,
        },
      ],
    });
    queryClient.setQueryData(['instituciones-lite'], {
      ok: true,
      data: [{ id: 'i-1', nombre: 'I.E. San Martín', modalidad: 'EBR', nivelEducativo: 'Primaria', estado: 'Activa' }],
    });
    queryClient.setQueryData(['docentes-lite'], {
      ok: true,
      data: [{ id: 'e-1', persona: { nombres: 'María', apellidos: 'López', dni: '456' } }],
    });
    queryClient.setQueryData(['solicitudes-all'], []);
    queryClient.setQueryData(['plantillas', undefined], [mockTemplate]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/monitoreo/ficha/v-100?plantillaId=tpl-200']}>
          <Routes>
            <Route path="/monitoreo/ficha/:visitaId" element={<LlenarFichaPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Debe renderizar el formulario habiendo reconstruido los modelos desde el cache
    expect(await screen.findByTestId('llenar-ficha-form')).toBeInTheDocument();
    expect(screen.getByText('Visita: v-100')).toBeInTheDocument();
    expect(screen.getByText('Plantilla: tpl-200')).toBeInTheDocument();
    expect(screen.getByText('Docente: María López')).toBeInTheDocument();
  });

  it('muestra aviso de error si la visita no existe en la caché ni en el servidor', async () => {
    queryClient.setQueryData(['cronogramas'], []);
    queryClient.setQueryData(['plantillas', undefined], []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/monitoreo/ficha/v-inexistente']}>
          <Routes>
            <Route path="/monitoreo/ficha/:visitaId" element={<LlenarFichaPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('No se pudo abrir la ficha')).toBeInTheDocument();
    expect(
      screen.getByText('Volvé a abrirla desde el Calendario o desde Reportes.'),
    ).toBeInTheDocument();
  });
});
