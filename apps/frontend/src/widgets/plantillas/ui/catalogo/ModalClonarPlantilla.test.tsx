import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalClonarPlantilla } from './ModalClonarPlantilla';

describe('ModalClonarPlantilla', () => {
  it('renderiza título, año y campo opcional de nombre', () => {
    render(
      <ModalClonarPlantilla
        anio={2026}
        onAnioChange={vi.fn()}
        nombre=""
        onNombreChange={vi.fn()}
        plantillaOriginalNombre="Rúbrica Oficial Docente"
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    expect(screen.getByText('Clonar Plantilla')).toBeInTheDocument();
    expect(screen.getByText(/Rúbrica Oficial Docente/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de la ficha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Año Académico Destino/i)).toHaveValue(2026);
  });

  it('permite escribir el nombre personalizado para la nueva ficha', async () => {
    const user = userEvent.setup();
    const onNombreChange = vi.fn();

    render(
      <ModalClonarPlantilla
        anio={2026}
        onAnioChange={vi.fn()}
        nombre=""
        onNombreChange={onNombreChange}
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    const inputNombre = screen.getByLabelText(/Nombre de la ficha/i);
    await user.type(inputNombre, 'Copia Secundaria Ciencias');

    expect(onNombreChange).toHaveBeenCalled();
  });

  it('llama a onConfirmar al pulsar el botón Clonar', async () => {
    const user = userEvent.setup();
    const onConfirmar = vi.fn();

    render(
      <ModalClonarPlantilla
        anio={2026}
        onAnioChange={vi.fn()}
        onConfirmar={onConfirmar}
        onCancelar={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clonar' }));
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });
});
