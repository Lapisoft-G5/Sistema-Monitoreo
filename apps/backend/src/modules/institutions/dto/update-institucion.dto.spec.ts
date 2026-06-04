import { validate } from 'class-validator';
import { UpdateInstitucionDto } from './update-institucion.dto.js';

describe('UpdateInstitucionDto', () => {
  it('should validate successfully with no fields', async () => {
    const dto = new UpdateInstitucionDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate successfully with some fields', async () => {
    const dto = new UpdateInstitucionDto();
    dto.nombre = 'Nuevo Nombre';
    dto.zona = 'Rural';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if a field is empty string', async () => {
    const dto = new UpdateInstitucionDto();
    dto.nombre = ''; // Empty string

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('nombre');
  });
});
