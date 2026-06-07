import { validate } from 'class-validator';
import { ResetPasswordDto } from './reset-password.dto.js';

describe('ResetPasswordDto', () => {
  it('should pass validation with correct data', async () => {
    const dto = new ResetPasswordDto();
    dto.token = 'some-valid-token-string';
    dto.newPassword = 'NewSecurePassword123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when token is empty', async () => {
    const dto = new ResetPasswordDto();
    dto.token = '';
    dto.newPassword = 'NewSecurePassword123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'token')).toBeDefined();
  });

  it('should fail when password is less than 8 characters', async () => {
    const dto = new ResetPasswordDto();
    dto.token = 'some-valid-token-string';
    dto.newPassword = 'Ab1';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const pwdError = errors.find((e) => e.property === 'newPassword');
    expect(pwdError).toBeDefined();
  });

  it('should fail when password lacks an uppercase letter', async () => {
    const dto = new ResetPasswordDto();
    dto.token = 'some-valid-token-string';
    dto.newPassword = 'newsecurepassword123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const pwdError = errors.find((e) => e.property === 'newPassword');
    expect(pwdError).toBeDefined();
  });

  it('should fail when password lacks a number', async () => {
    const dto = new ResetPasswordDto();
    dto.token = 'some-valid-token-string';
    dto.newPassword = 'NewSecurePassword';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const pwdError = errors.find((e) => e.property === 'newPassword');
    expect(pwdError).toBeDefined();
  });
});
