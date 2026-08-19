const REQUIRED_KEYS = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'AUTH_USERNAME',
  'AUTH_PASSWORD',
  'AUTH_EMAIL',
  'JWT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
] as const;

const TEST_DEFAULTS: Record<string, string> = {
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_USERNAME: 'test',
  DB_PASSWORD: 'test',
  DB_DATABASE: 'test',
  AUTH_USERNAME: 'admin',
  AUTH_PASSWORD: 'secret',
  AUTH_EMAIL: 'admin@example.com',
  JWT_SECRET: 'test-secret-at-least-32-characters',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '587',
  SMTP_USER: 'user',
  SMTP_PASS: 'pass',
  SMTP_FROM: 'noreply@example.com',
};

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const merged = {
    ...(process.env.NODE_ENV === 'test' ? TEST_DEFAULTS : {}),
    ...config,
  };

  const missing = REQUIRED_KEYS.filter((key) => {
    const value = merged[key];
    return typeof value !== 'string' || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno: ${missing.join(', ')}. Revisa .env.example`,
    );
  }

  const jwtSecret = merged.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }

  return merged;
}
