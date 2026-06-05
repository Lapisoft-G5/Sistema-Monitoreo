import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard.js';
import { ALLOW_FIRST_LOGIN_KEY } from '../decorators/allow-first-login.decorator.js';
import { AuthRepository } from '../repositories/auth.repository.js';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let reflector: jest.Mocked<Reflector>;
  let authRepository: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const jwtMock = {
      verifyAsync: jest.fn<any>(),
    };
    const reflectorMock = {
      getAllAndOverride: jest.fn<any>(),
    };
    const authRepoMock = {
      isSessionActive: jest.fn<any>().mockResolvedValue(true), // Default active session
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: jwtMock },
        { provide: Reflector, useValue: reflectorMock },
        { provide: AuthRepository, useValue: authRepoMock },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    reflector = module.get(Reflector) as jest.Mocked<Reflector>;
    authRepository = module.get(AuthRepository) as jest.Mocked<AuthRepository>;
  });

  function createMockContext(authHeader?: string): ExecutionContext {
    const req = {
      headers: {
        authorization: authHeader,
      },
    };
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

  it('should throw UnauthorizedException if no token is provided', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token type is not Bearer', async () => {
    const context = createMockContext('Basic abc');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    const context = createMockContext('Bearer invalid-token');
    jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true and assign user to request if token is valid and firstLogin is false', async () => {
    const context = createMockContext('Bearer valid-token');
    const payload = { sub: 'user-uuid', firstLogin: false, jti: 'session-jti' };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(payload);
  });

  it('should throw UnauthorizedException if session is inactive in database', async () => {
    const context = createMockContext('Bearer valid-token');
    const payload = { sub: 'user-uuid', firstLogin: false, jti: 'session-jti' };
    jwtService.verifyAsync.mockResolvedValue(payload);
    authRepository.isSessionActive.mockResolvedValue(false); // Inactive session

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(authRepository.isSessionActive).toHaveBeenCalledWith('session-jti');
  });

  it('should throw ForbiddenException if user has firstLogin=true and endpoint does not allow it', async () => {
    const context = createMockContext('Bearer valid-token');
    const payload = { sub: 'user-uuid', firstLogin: true };
    jwtService.verifyAsync.mockResolvedValue(payload);
    reflector.getAllAndOverride.mockReturnValue(false); // Does NOT allow first login

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ALLOW_FIRST_LOGIN_KEY, expect.any(Array));
  });

  it('should return true if user has firstLogin=true and endpoint allows it', async () => {
    const context = createMockContext('Bearer valid-token');
    const payload = { sub: 'user-uuid', firstLogin: true };
    jwtService.verifyAsync.mockResolvedValue(payload);
    reflector.getAllAndOverride.mockReturnValue(true); // DOES allow first login

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
