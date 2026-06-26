import { validate } from 'class-validator';
import { ForgotPasswordDto } from '../../../../../src/modules/auth/dto/forgot-password.dto.js';

describe('ForgotPasswordDto', () => {
  it('should pass validation with correct data', async () => {
    const dto = new ForgotPasswordDto();
    dto.dni = '76358911';
    dto.email = 'carlos.quispe@ugel-lampa.gob.pe';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when DNI is not 8 digits', async () => {
    const dto = new ForgotPasswordDto();
    dto.dni = '12345';
    dto.email = 'carlos.quispe@ugel-lampa.gob.pe';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('dni');
  });

  it('should fail when email is invalid', async () => {
    const dto = new ForgotPasswordDto();
    dto.dni = '76358911';
    dto.email = 'invalid-email';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });
});
