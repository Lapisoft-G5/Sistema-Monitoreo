import { validate } from 'class-validator';
import { QueryEspecialistaDto } from './query-especialista.dto.js';

describe('QueryEspecialistaDto', () => {
  it('should pass validation with no fields (all optional)', async () => {
    const dto = new QueryEspecialistaDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with estado filter only', async () => {
    const dto = new QueryEspecialistaDto();
    dto.estado = 'Activo';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with especialidad filter only', async () => {
    const dto = new QueryEspecialistaDto();
    dto.especialidad = 'Matemáticas';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with all optional filters provided', async () => {
    const dto = new QueryEspecialistaDto();
    dto.estado = 'Activo';
    dto.especialidad = 'Matemáticas';
    dto.nivelEducativo = 'Secundaria';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
