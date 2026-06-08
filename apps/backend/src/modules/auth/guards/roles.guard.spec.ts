import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const reflectorMock = {
      getAllAndOverride: jest.fn<any>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: reflectorMock }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  function createMockContext(user?: { role?: string }): ExecutionContext {
    const req = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(null); // No roles required
    const context = createMockContext();

    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, expect.any(Array));
  });

  it('should throw ForbiddenException if roles are required but user is not in request', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if roles are required but user has no role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({});

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user role does not match required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'SUPERUSER']);
    const context = createMockContext({ role: 'USER' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access if user role matches one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'SUPERUSER']);
    const context = createMockContext({ role: 'SUPERUSER' });

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });
});
