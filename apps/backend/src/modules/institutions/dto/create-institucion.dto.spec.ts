import { validate } from 'class-validator';
import { CreateInstitucionDto } from './create-institucion.dto.js';

describe('CreateInstitucionDto', () => {
  it('should validate successfully with correct data', async () => {
    const dto = new CreateInstitucionDto();
    dto.codigoModular = '1234567';
    dto.codigoLocal = '12345678';
    dto.nombre = 'I.E. Los Libertadores';
    dto.nivelEducativo = 'Secundaria';
    dto.provincia = 'Lampa';
    dto.distrito = 'Lampa';
    dto.direccion = 'Jr. Bolognesi 123';
    dto.zona = 'Urbana';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when codigoModular is not 7 digits', async () => {
    const dto = new CreateInstitucionDto();
    dto.codigoModular = '123456'; // 6 digits
    dto.codigoLocal = '12345678';
    dto.nombre = 'I.E. Los Libertadores';
    dto.nivelEducativo = 'Secundaria';
    dto.provincia = 'Lampa';
    dto.distrito = 'Lampa';
    dto.direccion = 'Jr. Bolognesi 123';
    dto.zona = 'Urbana';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('codigoModular');
  });

  it('should fail validation when codigoLocal is not 8 digits', async () => {
    const dto = new CreateInstitucionDto();
    dto.codigoModular = '1234567';
    dto.codigoLocal = '1234567'; // 7 digits
    dto.nombre = 'I.E. Los Libertadores';
    dto.nivelEducativo = 'Secundaria';
    dto.provincia = 'Lampa';
    dto.distrito = 'Lampa';
    dto.direccion = 'Jr. Bolognesi 123';
    dto.zona = 'Urbana';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('codigoLocal');
  });

  it('should fail validation when codigoLocal contains non-numeric characters', async () => {
    const dto = new CreateInstitucionDto();
    dto.codigoModular = '1234567';
    dto.codigoLocal = '1234567a';
    dto.nombre = 'I.E. Los Libertadores';
    dto.nivelEducativo = 'Secundaria';
    dto.provincia = 'Lampa';
    dto.distrito = 'Lampa';
    dto.direccion = 'Jr. Bolognesi 123';
    dto.zona = 'Urbana';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('codigoLocal');
  });

  it('should fail validation when required fields are missing', async () => {
    const dto = new CreateInstitucionDto();
    dto.codigoModular = '1234567';
    dto.codigoLocal = '12345678';
    // missing nombre, nivelEducativo, etc.

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
