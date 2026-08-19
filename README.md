# Tickets API

API NestJS de solo lectura sobre `tickets_osnet` para alimentar un dashboard. Autenticación en dos pasos: usuario/contraseña (variables de entorno) y código MFA enviado por email.

## Configuración

Copia `.env.example` a `.env` y completa:

- Credenciales del usuario del dashboard (`AUTH_USERNAME`, `AUTH_PASSWORD`, `AUTH_EMAIL`)
- Conexión MySQL remota (`DB_*`)
- SMTP para el código MFA (`SMTP_*`)
- `JWT_SECRET` (mínimo 32 caracteres)

```bash
cp .env.example .env
npm install
npm run start:dev
```

La API no crea ni modifica la tabla. `synchronize` está desactivado.

Swagger: [http://localhost:3000/docs](http://localhost:3000/docs). Autoriza con el JWT de `/auth/verify-mfa`.

## Flujo de autenticación

1. `POST /auth/login` con `{ "username", "password" }`
2. Se envía un código de 6 dígitos a `AUTH_EMAIL` (válido 10 minutos)
3. `POST /auth/verify-mfa` con `{ "challengeId", "code" }`
4. Usa el `access_token` como `Authorization: Bearer <token>`

## Endpoints (requieren JWT salvo `/health` y `/auth/*`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servicio |
| POST | `/auth/login` | Paso 1 MFA |
| POST | `/auth/verify-mfa` | Paso 2 MFA, devuelve JWT |
| GET | `/tickets` | Listado paginado y filtros |
| GET | `/tickets/stats` | Conteos para el dashboard |
| GET | `/tickets/filters` | Valores distintos para combos |
| GET | `/tickets/:id` | Detalle de un ticket |

Filtros de query en listado y stats: `page`, `limit`, `estatus`, `pueblo`, `agente`, `tipo_cliente`, `referred_by`, `plan_instalado`, `search`, `from`, `to` (ISO 8601).
