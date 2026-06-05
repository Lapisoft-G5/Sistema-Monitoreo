import { validate } from 'class-validator';
import { LoginDto } from './login.dto.js';

describe('LoginDto', () => {
  it('should pass validation with correct data', async () => {
    const dto = new LoginDto();
    dto.dni = '76358911';
    dto.password = 'StrongPassword123!';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when dni is empty', async () => {
    const dto = new LoginDto();
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('dni');
  });

  it('should fail validation when dni is not 8 digits', async () => {
    const dto = new LoginDto();
    dto.dni = '12345';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('dni');
  });

  it('should fail validation when dni contains non-numeric characters', async () => {
    const dto = new LoginDto();
    dto.dni = '1234567a';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('dni');
  });

  it('should fail validation when password is empty', async () => {
    const dto = new LoginDto();
    dto.dni = '76358911';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});

