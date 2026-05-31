import { validate } from 'class-validator';
import { LoginDto } from './login.dto.js';

describe('LoginDto', () => {
  it('should pass validation with correct data', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';
    dto.password = 'StrongPassword123!';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when email is empty', async () => {
    const dto = new LoginDto();
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail validation when email is invalid', async () => {
    const dto = new LoginDto();
    dto.email = 'invalid-email';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail validation when password is empty', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
