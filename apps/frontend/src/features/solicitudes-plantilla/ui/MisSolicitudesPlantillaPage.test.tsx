import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MisSolicitudesPlantillaPage } from './MisSolicitudesPlantillaPage';
import { solicitudesPlantillaApi } from '@shared/api/solicitudes-plantilla.api';

/**
 * Formulario del pedido de plantillas, visto por el director de la I.E.
 *
 * Lo que se fija acá es el adjunto. Un `input[type=file]` guarda el archivo en
 * el DOM y no en React: vaciar el estado no lo borra, de modo que quitar el PDF
 * y no limpiar el elemento dejaría el nombre en pantalla y el archivo viejo
 * adentro. Es una desincronización que no da error y que sólo se ve mirando.
 */

vi.mock('@shared/api/solicitudes-plantilla.api', () => ({
  solicitudesPlantillaApi: {
    mias: vi.fn(),
    crear: vi.fn(),
  },
}));

const pdf = (nombre = 'justificacion.pdf') =>
  new File(['%PDF-1.7 contenido'], nombre, { type: 'application/pdf' });

const montar = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MisSolicitudesPlantillaPage />
    </QueryClientProvider>,
  );
};

const campoPdf = () => screen.getByLabelText(/Justificación en PDF/i) as HTMLInputElement;
const botonQuitar = () => screen.getByRole('button', { name: /Quitar el archivo adjunto/i });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(solicitudesPlantillaApi.mias).mockResolvedValue({ solicitudes: [], pendientes: 0 });
});

describe('MisSolicitudesPlantillaPage — el adjunto', () => {
  it('quitar el archivo lo borra tambien del campo, no solo del estado', async () => {
    montar();
    await userEvent.click(await screen.findByRole('button', { name: /Nueva solicitud/i }));

    await userEvent.upload(campoPdf(), pdf());
    expect(campoPdf().files?.[0]?.name).toBe('justificacion.pdf');

    await userEvent.click(botonQuitar());

    // Si sólo se hubiera vaciado el estado de React, el navegador seguiría
    // mostrando el nombre del PDF que el usuario acaba de quitar.
    expect(campoPdf().value).toBe('');
    expect(campoPdf().files?.length ?? 0).toBe(0);
  });

  it('deja volver a elegir un archivo despues de quitarlo', async () => {
    // El caso que rompe si el campo no se limpia: el navegador no dispara
    // `change` al reelegir el MISMO archivo, y el formulario quedaría trabado.
    montar();
    await userEvent.click(await screen.findByRole('button', { name: /Nueva solicitud/i }));

    await userEvent.upload(campoPdf(), pdf());
    await userEvent.click(botonQuitar());
    await userEvent.upload(campoPdf(), pdf());

    expect(campoPdf().files?.[0]?.name).toBe('justificacion.pdf');
  });

  it('no se puede presentar la solicitud sin adjunto', async () => {
    // El PDF es el documento sobre el que decide la Jefatura: sin él, el
    // trámite no tiene sustento.
    montar();
    await userEvent.click(await screen.findByRole('button', { name: /Nueva solicitud/i }));

    await userEvent.type(
      screen.getByLabelText(/Descripción de la plantilla 1/i),
      'Ficha del taller',
    );

    expect(screen.getByRole('button', { name: /Presentar solicitud/i })).toBeDisabled();
  });

  it('el boton de quitar no ocupa lugar mientras no hay archivo', async () => {
    montar();
    await userEvent.click(await screen.findByRole('button', { name: /Nueva solicitud/i }));

    expect(botonQuitar()).toBeDisabled();
    expect(botonQuitar().className).toContain('invisible');
  });
});
