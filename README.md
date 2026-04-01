# Todo App Backend

NestJS + TypeScript backend for authentication (OTP-based) and Todo CRUD operations.

This service provides:
- User signup, login, and verification flows
- OTP-based email verification and password reset
- JWT-protected Todo APIs
- Health endpoints for uptime/database checks
- PostgreSQL persistence via TypeORM
- SMTP integration for OTP delivery

## Tech Stack

- NestJS 11
- TypeScript
- TypeORM 0.3
- PostgreSQL (`pg`)
- Passport JWT (`passport-jwt`)
- bcrypt
- Nodemailer

## Project Structure

```text
Todo App Backend/
  api/
    index.ts                    # Vercel serverless entry
  src/
    app.module.ts
    main.ts
    auth/
      auth.controller.ts
      auth.module.ts
      auth.service.ts
      jwt.strategy.ts
      dto/
    users/
      users.module.ts
      users.service.ts
      entities/user.entity.ts
    otp/
      otp.module.ts
      otp.service.ts
      entities/otp.entity.ts
    todo/
      todo.controller.ts
      todo.module.ts
      todo.service.ts
      dto/
      entities/todo.entity.ts
    mail/
      mail.module.ts
      mail.service.ts
    health/
      health.controller.ts
      health.module.ts
    common/
      constants/
      decorators/
      guards/
      utils/
  .env.example
  package.json
  tsconfig.json
  tsconfig.build.json
  vercel.json
```

## Core Modules

## Auth Module

Handles:
- Signup
- Login
- OTP verification
- Forgot password
- Reset password

## Users Module

Handles user persistence and profile flags (e.g., `isVerified`).

## OTP Module

Handles OTP generation, validation, expiry, and consumption for:
- Email verification
- Password reset

## Todo Module

JWT-protected CRUD for user-owned todos.

## Mail Module

Sends OTP emails through SMTP.

## Health Module

Exposes root and health endpoints:
- `GET /`
- `GET /health`

## Environment Variables

Create `Todo App Backend/.env` from `.env.example`.

Required variables:

```env
# App
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todo_app
DB_SSL=false
DB_SYNC=true

# Auth
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=1d
OTP_EXPIRES_MINUTES=10

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
MAIL_FROM=Todo App <your-email@example.com>
```

## Supabase Example

For Supabase pooler-style connection:

```env
DB_HOST=aws-1-ap-northeast-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.yourprojectref
DB_PASSWORD=your-password
DB_NAME=postgres
DB_SSL=true
DB_SYNC=false
```

## Installation

```bash
npm install
```

## Run Locally

Development:

```bash
npm run start:dev
```

Build:

```bash
npm run build
```

Start production build:

```bash
npm run start
```

Default local URL:
- `http://localhost:4000`

## Scripts

- `npm run start:dev` - start backend in watch/dev mode
- `npm run build` - compile TypeScript
- `npm run start` - run compiled backend
- `npm run test` - placeholder test command

## API Endpoints

## Health

- `GET /`
  - Response:
  ```json
  {
    "message": "Todo App Backend is running",
    "health": "/health"
  }
  ```

- `GET /health`
  - Response:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-04-01T00:00:00.000Z",
    "uptimeSeconds": 123.45,
    "database": "up"
  }
  ```

## Auth

- `POST /auth/signup`
  - Body:
  ```json
  { "email": "user@example.com", "password": "secret123" }
  ```

- `POST /auth/verify-otp`
  - Body:
  ```json
  { "email": "user@example.com", "otp": "123456" }
  ```

- `POST /auth/login`
  - Body:
  ```json
  { "email": "user@example.com", "password": "secret123" }
  ```
  - Returns JWT token + user

- `POST /auth/forgot-password`
  - Body:
  ```json
  { "email": "user@example.com" }
  ```

- `POST /auth/verify-reset-otp`
  - Body:
  ```json
  { "email": "user@example.com", "otp": "123456" }
  ```

- `POST /auth/reset-password`
  - Body:
  ```json
  { "email": "user@example.com", "otp": "123456", "newPassword": "newpass123" }
  ```

## Todos (JWT Required)

Send header:

```http
Authorization: Bearer <accessToken>
```

- `POST /todos`
  - Body:
  ```json
  { "title": "Buy milk", "description": "2" }
  ```

- `GET /todos`

- `GET /todos/:id`

- `PATCH /todos/:id`
  - Body (partial):
  ```json
  { "title": "Buy bread", "description": "1", "completed": true }
  ```

- `DELETE /todos/:id`

## CORS Configuration

CORS is controlled by `FRONTEND_ORIGIN` and supports:
- Comma-separated allowlist
- `Authorization` and `Content-Type` headers
- Preflight `OPTIONS` handling

Example:

```env
FRONTEND_ORIGIN=https://your-frontend.vercel.app,http://localhost:3000
```

## Data Model (Summary)

- `User`
  - `id`, `email`, `passwordHash`, `isVerified`, timestamps

- `Otp`
  - `id`, `email`, `code`, `type`, `expiresAt`, `consumedAt`, timestamps

- `Todo`
  - `id`, `title`, `description`, `completed`, `userId`, timestamps

## Deployment

## Option A: Node Host (Recommended)

Deploy on Render/Railway/Fly:
- Build: `npm run build`
- Start: `npm run start`
- Add all env vars from above
- Set `DB_SYNC=false` in production

## Option B: Vercel (Serverless)

This repository includes:
- `api/index.ts` serverless Nest bootstrap
- `vercel.json` rewrite to `/api`

Steps:
1. Vercel project root directory: `Todo App Backend`
2. Set backend environment variables
3. Deploy
4. Verify:
   - `https://your-backend-domain/`
   - `https://your-backend-domain/health`

## Production Checklist

- `DB_SYNC=false`
- Strong `JWT_SECRET`
- Valid SMTP credentials
- Correct `FRONTEND_ORIGIN`
- `/health` returns `status: ok` and `database: up`

## Troubleshooting

## 1. CORS Error (No Access-Control-Allow-Origin)

- Check `FRONTEND_ORIGIN` exactly matches frontend domain.
- If using previews/local, include comma-separated origins.
- Redeploy backend after env update.

## 2. Database Connection Fails

- Verify host/user/password/db/port.
- For Supabase, ensure `DB_SSL=true`.
- Confirm database exists and credentials are valid.

## 3. OTP Email Not Sent

- Check SMTP credentials and provider security rules.
- For Gmail, use app password (not regular account password).

## 4. Vercel Backend 404

- Ensure project root directory is `Todo App Backend`.
- Ensure `api/index.ts` and `vercel.json` are present.

## Security Notes

- Never commit `.env` to source control.
- Rotate credentials if they were exposed.
- Use least-privileged DB credentials where possible.

## License

This project currently uses the package-level ISC license defined in `package.json`.
