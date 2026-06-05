import { validate } from 'class-validator';
import { CreateEspecialistaDto } from './create-especialista.dto.js';

describe('CreateEspecialistaDto', () => {
  it('should pass validation with all required fields', async () => {
    const dto = new CreateEspecialistaDto();
    dto.dni = '12345678';
    dto.nombres = 'Juan Carlos';
    dto.apellidos = 'Pérez Quispe';
    dto.especialidad = 'Matemáticas';
    dto.nivelEducativo = 'Secundaria';
    dto.rolCode = 'especialista_admin';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when optional correo is provided', async () => {
    const dto = new CreateEspecialistaDto();
    dto.dni = '12345678';
    dto.nombres = 'Juan';
    dto.apellidos = 'Pérez';
    dto.correo = 'juan@test.com';
    dto.especialidad = 'Ciencias';
    dto.nivelEducativo = 'Primaria';
    dto.rolCode = 'director_ugel';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when dni is shorter than 8 characters', async () => {
    const dto = new CreateEspecialistaDto();
    dto.dni = '12345';
    dto.nombres = 'Juan';
    dto.apellidos = 'Pérez';
    dto.especialidad = 'Matemáticas';
    dto.nivelEducativo = 'Secundaria';
    dto.rolCode = 'especialista_admin';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'dni')).toBeDefined();
  });

  it('should fail validation when dni is longer than 8 characters', async () => {
    const dto = new CreateEspecialistaDto();
    dto.dni = '123456789';
    dto.nombres = 'Juan';
    dto.apellidos = 'Pérez';
    dto.especialidad = 'Matemáticas';
    dto.nivelEducativo = 'Secundaria';
    dto.rolCode = 'especialista_admin';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'dni')).toBeDefined();
  });

  it('should fail validation when dni is empty', async () => {
    const dto = new CreateEspecialistaDto();
    dto.nombres = 'Juan';
    dto.apellidos = 'Pérez';
    dto.especialidad = 'Matemáticas';
    dto.nivelEducativo = 'Secundaria';
    dto.rolCode = 'especialista_admin';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'dni')).toBeDefined();
  });

  it('should fail validation when nombres is empty', async () => {
    const dto = new CreateEspecialistaDto();
    dto.dni = '12345678';
    dto.apellidos = 'Pérez';
    dto.especialidad = 'Matemáticas';
    dto.nivelEducativo = 'Secundaria';
    dto.rolCode = 'especialista_admin';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'nombres')).toBeDefined();
  });

  it('should fail validation when correo is not a valid email', async () => {
    const dto = new CreateEspecialistaDto();
    dto.dni = '12345678';
    dto.nombres = 'Juan';
    dto.apellidos = 'Pérez';
    dto.correo = 'not-an-email';
    dto.especialidad = 'Matemáticas';
    dto.nivelEducativo = 'Secundaria';
    dto.rolCode = 'especialista_admin';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'correo')).toBeDefined();
  });

  it('should fail validation when rolCode is empty', async () => {
    const dto = new CreateEspecialistaDto();
    dto.dni = '12345678';
    dto.nombres = 'Juan';
    dto.apellidos = 'Pérez';
    dto.especialidad = 'Matemáticas';
    dto.nivelEducativo = 'Secundaria';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'rolCode')).toBeDefined();
  });

  it('should fail validation when especialidad is empty', async () => {
    const dto = new CreateEspecialistaDto();
    dto.dni = '12345678';
    dto.nombres = 'Juan';
    dto.apellidos = 'Pérez';
    dto.nivelEducativo = 'Secundaria';
    dto.rolCode = 'especialista_admin';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'especialidad')).toBeDefined();
  });
});
