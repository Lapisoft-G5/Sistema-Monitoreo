import { describe, it, expect } from 'vitest';
import { useRef, useState, createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DatosPersonalesSection,
  type DatosPersonalesSectionProps,
  type PersonaFormData,
} from './DatosPersonalesSection';

const PH = {
  dni: '8 dígitos',
  nombres: 'Ej. Juan Carlos',
  apellidos: 'Ej. Pérez López',
  correo: 'Ej. jperez@ugel-lampa.gob.pe',
  celular: 'Ej. 987654321',
} as const;

/** Wrapper con estado real para que los inputs controlados reflejen la sanitización. */
function Harness({
  initial = {},
  ...props
}: Partial<Omit<DatosPersonalesSectionProps<PersonaFormData>, 'form' | 'onChange'>> & {
  initial?: Partial<PersonaFormData>;
}) {
  const [form, setForm] = useState<PersonaFormData>({
    dni: '',
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    ...initial,
  });
  const onChange = <K extends keyof PersonaFormData>(field: K, value: PersonaFormData[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <DatosPersonalesSection
      form={form}
      onChange={onChange}
      showError={() => undefined}
      {...props}
    />
  );
}

describe('DatosPersonalesSection', () => {
  it('renderiza los campos de datos personales', () => {
    render(<Harness />);
    expect(screen.getByPlaceholderText(PH.dni)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(PH.nombres)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(PH.apellidos)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(PH.correo)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(PH.celular)).toBeInTheDocument();
  });

  // ── Regresión guardada: el celularRef debe apuntar al contenedor del ──
  // ── campo Celular para que el scroll/focus al error siga funcionando. ──
  it('reenvía celularRef al contenedor del campo Celular', () => {
    const celularRef = createRef<HTMLDivElement>();
    render(<Harness celularRef={celularRef} />);

    expect(celularRef.current).not.toBeNull();
    const input = celularRef.current?.querySelector('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', PH.celular);
  });

  it('el useEffect de un formulario puede hacer focus vía celularRef (integración)', () => {
    // Simula el patrón real de los formularios: un ref de useRef enlazado al celular.
    function ConRefReal() {
      const ref = useRef<HTMLDivElement>(null);
      return (
        <div>
          <button
            onClick={() => ref.current?.querySelector('input')?.focus()}
            type="button"
          >
            focus celular
          </button>
          <Harness celularRef={ref} />
        </div>
      );
    }
    render(<ConRefReal />);
    screen.getByText('focus celular').click();
    expect(screen.getByPlaceholderText(PH.celular)).toHaveFocus();
  });

  describe('sanitización de entradas', () => {
    it('el DNI descarta no-dígitos y se limita a 8 caracteres', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      const dni = screen.getByPlaceholderText(PH.dni);
      await user.type(dni, '12ab34567890');
      expect(dni).toHaveValue('12345678');
    });

    it('el celular descarta no-dígitos y se limita a 9 caracteres', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      const celular = screen.getByPlaceholderText(PH.celular);
      await user.type(celular, '9-8-7 6 5 4 3 2 1 0');
      expect(celular).toHaveValue('987654321');
    });
  });

  describe('estado bloqueado', () => {
    it('deshabilita nombres/apellidos/correo/celular pero no el DNI cuando isDniLocked', () => {
      render(<Harness isDniLocked />);
      expect(screen.getByPlaceholderText(PH.nombres)).toBeDisabled();
      expect(screen.getByPlaceholderText(PH.apellidos)).toBeDisabled();
      expect(screen.getByPlaceholderText(PH.correo)).toBeDisabled();
      expect(screen.getByPlaceholderText(PH.celular)).toBeDisabled();
      expect(screen.getByPlaceholderText(PH.dni)).toBeEnabled();
    });
  });

  describe('banners de feedback', () => {
    it('muestra el mensaje de DNI cuando hay dniMessage y no se está buscando', () => {
      render(<Harness dniMessage="Persona encontrada en el padrón" />);
      expect(screen.getByText('Persona encontrada en el padrón')).toBeInTheDocument();
    });

    it('oculta el dniMessage mientras se busca (searchingDni)', () => {
      render(<Harness dniMessage="Persona encontrada" searchingDni />);
      expect(screen.queryByText('Persona encontrada')).not.toBeInTheDocument();
    });

    it('muestra banner de bloqueo cuando roleCheck.bloquea', () => {
      render(<Harness roleCheck={{ mensaje: 'El DNI ya tiene otro rol', bloquea: true }} />);
      expect(screen.getByText('Bloqueado:')).toBeInTheDocument();
      expect(screen.getByText(/El DNI ya tiene otro rol/)).toBeInTheDocument();
    });

    it('muestra banner de advertencia cuando roleCheck no bloquea', () => {
      render(<Harness roleCheck={{ mensaje: 'Revisa los datos', bloquea: false }} />);
      expect(screen.getByText('Advertencia:')).toBeInTheDocument();
    });
  });

  describe('errores por campo', () => {
    it('muestra el texto de error que devuelve showError', () => {
      render(
        <Harness showError={(f) => (f === 'dni' ? 'El DNI debe tener 8 dígitos' : undefined)} />,
      );
      expect(screen.getByText('El DNI debe tener 8 dígitos')).toBeInTheDocument();
    });
  });
});
