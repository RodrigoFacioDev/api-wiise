# Impact Hub API

Backend API for a social impact space scheduling system. The business model replaces financial payment with measurable social contributions (donations, free classes, educational content). Every reservation generates traceable impact.

## Stack
- Node.js 22+ (TypeScript, ESM)
- Fastify v5 (@fastify/swagger, @fastify/jwt)
- Drizzle ORM (PostgreSQL)
- Zod Validation
- Vitest

## Getting Started

1. Set up your environment variables:
```bash
cp .env.example .env
```

2. Start the database using Docker:
```bash
docker compose up -d
```

3. Install dependencies:
```bash
npm install
```

4. Run migrations and seed data:
```bash
make migrate
make seed
```

5. Start the development server:
```bash
make dev
```

6. Open the Swagger API documentation at:
`http://localhost:3333/docs`

## Features
- **Equivalence Calculation**: Automatically converts area values into suggested contributions.
- **Reputation System**: Users build reputation via impact validation.
- **Role-Based Access Control**: Admins can approve/reject reservations and validate contributions.
