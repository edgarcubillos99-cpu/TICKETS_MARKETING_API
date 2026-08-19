import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomInt, randomUUID, timingSafeEqual } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { MailService } from './mail.service';

type MfaChallenge = {
  codeHash: string;
  expiresAt: number;
  attempts: number;
};

const MFA_TTL_MS = 10 * 60 * 1000;
const MFA_MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly challenges = new Map<string, MfaChallenge>();

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto) {
    const username = this.configService.getOrThrow<string>('AUTH_USERNAME');
    const password = this.configService.getOrThrow<string>('AUTH_PASSWORD');
    const email = this.configService.getOrThrow<string>('AUTH_EMAIL');

    const validUser = this.safeEqual(loginDto.username, username);
    const validPass = this.safeEqual(loginDto.password, password);

    if (!validUser || !validPass) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const code = String(randomInt(100000, 1000000));
    const challengeId = randomUUID();

    this.challenges.set(challengeId, {
      codeHash: this.hash(code),
      expiresAt: Date.now() + MFA_TTL_MS,
      attempts: 0,
    });

    try {
      await this.mailService.sendMfaCode(email, code);
    } catch {
      this.challenges.delete(challengeId);
      throw new UnauthorizedException(
        'No se pudo enviar el código de verificación. Revisa la configuración SMTP.',
      );
    }

    if (this.configService.get('NODE_ENV') !== 'production') {
      this.logger.debug(`Código MFA generado para el challenge ${challengeId}`);
    }

    this.cleanupExpired();

    return {
      challengeId,
      message: 'Se envió un código de verificación al correo registrado',
    };
  }

  async verifyMfa(dto: VerifyMfaDto) {
    const challenge = this.challenges.get(dto.challengeId);

    if (!challenge) {
      throw new UnauthorizedException('Desafío MFA inválido o expirado');
    }

    if (Date.now() > challenge.expiresAt) {
      this.challenges.delete(dto.challengeId);
      throw new UnauthorizedException('Desafío MFA inválido o expirado');
    }

    challenge.attempts += 1;

    if (challenge.attempts > MFA_MAX_ATTEMPTS) {
      this.challenges.delete(dto.challengeId);
      throw new UnauthorizedException(
        'Demasiados intentos. Inicia sesión de nuevo',
      );
    }

    if (!this.safeEqual(this.hash(dto.code), challenge.codeHash)) {
      throw new UnauthorizedException('Código de verificación incorrecto');
    }

    this.challenges.delete(dto.challengeId);

    const username = this.configService.getOrThrow<string>('AUTH_USERNAME');
    const email = this.configService.getOrThrow<string>('AUTH_EMAIL');
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '8h';

    const accessToken = await this.jwtService.signAsync(
      { sub: username, email },
      {
        expiresIn: expiresIn as
          `${number}h` | `${number}m` | `${number}s` | number,
      },
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private safeEqual(a: string, b: string): boolean {
    const ha = createHash('sha256').update(a).digest();
    const hb = createHash('sha256').update(b).digest();
    return timingSafeEqual(ha, hb);
  }

  private cleanupExpired() {
    const now = Date.now();
    for (const [id, challenge] of this.challenges) {
      if (now > challenge.expiresAt) {
        this.challenges.delete(id);
      }
    }
  }
}
