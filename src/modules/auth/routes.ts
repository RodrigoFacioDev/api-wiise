import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../../shared/schemas/auth.js';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { AppError } from '../../shared/errors/AppError.js';
import crypto from 'crypto';
import { authenticate } from '../../shared/middlewares/auth.js';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.post('/auth/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      body: registerSchema,
      response: {
        201: z.object({ id: z.string(), email: z.string() })
      }
    }
  }, async (request, reply) => {
    const { name, email, password, role } = request.body;
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      throw new AppError('User already exists', 'USER_ALREADY_EXISTS', 400);
    }

    const passwordHash = hashPassword(password);
    const result = await db.insert(users).values({
      name, email, passwordHash, role
    }).returning({ id: users.id, email: users.email });

    return reply.status(201).send(result[0]);
  });

  server.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login',
      body: loginSchema,
      response: {
        200: z.object({ token: z.string() })
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body;
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = existing[0];

    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new AppError('Invalid credentials', 'UNAUTHORIZED', 401);
    }

    const token = await reply.jwtSign({ id: user.id, email: user.email, role: user.role });
    return reply.status(200).send({ token });
  });

  server.get('/auth/me', {
    preValidation: [authenticate],
    schema: {
      tags: ['Auth'],
      summary: 'Get current user profile',
      security: [{ bearerAuth: [] }],
      response: {
        200: z.object({ id: z.string(), name: z.string(), email: z.string(), role: z.string(), reputationScore: z.number(), reputationLevel: z.string() })
      }
    }
  }, async (request, reply) => {
    const jwtUser = request.user as { id: string };
    const existing = await db.select().from(users).where(eq(users.id, jwtUser.id)).limit(1);
    const user = existing[0];

    if (!user) throw new AppError('User not found', 'USER_NOT_FOUND', 404);

    return reply.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      reputationScore: user.reputationScore,
      reputationLevel: user.reputationLevel
    });
  });
}
