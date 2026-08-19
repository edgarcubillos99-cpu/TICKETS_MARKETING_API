import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';

describe('AuthService', () => {
  let service: AuthService;
  let mailService: { sendMfaCode: jest.Mock };

  beforeEach(async () => {
    mailService = { sendMfaCode: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) =>
              ({
                AUTH_USERNAME: 'admin',
                AUTH_PASSWORD: 'secret',
                AUTH_EMAIL: 'admin@example.com',
              })[key],
            get: (key: string) =>
              ({
                NODE_ENV: 'test',
                JWT_EXPIRES_IN: '8h',
              })[key],
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('jwt-token'),
          },
        },
        {
          provide: MailService,
          useValue: mailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('rechaza credenciales inválidas', async () => {
    await expect(
      service.login({ username: 'admin', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mailService.sendMfaCode).not.toHaveBeenCalled();
  });

  it('envía MFA si las credenciales son correctas', async () => {
    const result = await service.login({
      username: 'admin',
      password: 'secret',
    });

    expect(result.challengeId).toBeDefined();
    expect(mailService.sendMfaCode).toHaveBeenCalledWith(
      'admin@example.com',
      expect.stringMatching(/^\d{6}$/),
    );
  });
});
