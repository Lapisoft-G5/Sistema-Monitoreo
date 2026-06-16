import { validate } from 'class-validator';
import { UpdateEspecialistaDto } from './update-especialista.dto.js';

describe('UpdateEspecialistaDto', () => {
  it('should pass validation with all required fields', async () => {
    const dto = new UpdateEspecialistaDto();
    dto.nombres = 'Carlos';
    dto.apellidos = 'Quispe';
    dto.especialidad = 'Matemáticas';
    dto.nivelEducativo = 'Secundaria';
    dto.cargo = 'Especialista';
    dto.modalidad = 'EBR';
    dto.estado = 'Activo';
    dto.rolCode = 'director_ugel';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when optional correo is provided', async () => {
    const dto = new UpdateEspecialistaDto();
    dto.nombres = 'Carlos';
    dto.apellidos = 'Quispe';
    dto.correo = 'carlos@ugel.gob.pe';
    dto.especialidad = 'Matemáticas';
    dto.nivelEducativo = 'Secundaria';
    dto.cargo = 'Especialista';
    dto.modalidad = 'EBR';
    dto.estado = 'Activo';
    dto.rolCode = 'director_ugel';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when nombres is empty', async () => {
    const dto = new UpdateEspecialistaDto();
    dto.apellidos = 'Quispe';
    dto.especialidad = 'Ciencias';
    dto.nivelEducativo = 'Primaria';
    dto.estado = 'Activo';
    dto.rolCode = 'director_ugel';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'nombres')).toBeDefined();
  });

  it('should fail validation when apellidos is empty', async () => {
    const dto = new UpdateEspecialistaDto();
    dto.nombres = 'Carlos';
    dto.especialidad = 'Ciencias';
    dto.nivelEducativo = 'Primaria';
    dto.estado = 'Activo';
    dto.rolCode = 'director_ugel';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'apellidos')).toBeDefined();
  });

  it('should fail validation when estado is empty', async () => {
    const dto = new UpdateEspecialistaDto();
    dto.nombres = 'Carlos';
    dto.apellidos = 'Quispe';
    dto.especialidad = 'Ciencias';
    dto.nivelEducativo = 'Primaria';
    dto.rolCode = 'director_ugel';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'estado')).toBeDefined();
  });

  it('should fail validation when correo is not a valid email', async () => {
    const dto = new UpdateEspecialistaDto();
    dto.nombres = 'Carlos';
    dto.apellidos = 'Quispe';
    dto.correo = 'invalid-email';
    dto.especialidad = 'Ciencias';
    dto.nivelEducativo = 'Primaria';
    dto.estado = 'Activo';
    dto.rolCode = 'director_ugel';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'correo')).toBeDefined();
  });

  it('should fail validation when rolCode is empty', async () => {
    const dto = new UpdateEspecialistaDto();
    dto.nombres = 'Carlos';
    dto.apellidos = 'Quispe';
    dto.especialidad = 'Ciencias';
    dto.nivelEducativo = 'Primaria';
    dto.estado = 'Activo';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'rolCode')).toBeDefined();
  });
});
