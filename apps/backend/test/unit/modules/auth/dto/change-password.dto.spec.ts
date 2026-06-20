import { validate } from 'class-validator';
import { ChangePasswordDto } from '../../../../../src/modules/auth/dto/change-password.dto.js';

describe('ChangePasswordDto', () => {
  it('should pass validation with correct data', async () => {
    const dto = new ChangePasswordDto();
    dto.newPassword = 'StrongPassword123!';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when password is too short', async () => {
    const dto = new ChangePasswordDto();
    dto.newPassword = 'S1!'; // less than 8 chars

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('newPassword');
  });

  it('should fail when password lacks uppercase letter', async () => {
    const dto = new ChangePasswordDto();
    dto.newPassword = 'lowercase123!';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when password lacks a number', async () => {
    const dto = new ChangePasswordDto();
    dto.newPassword = 'NoNumbersHere!';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
