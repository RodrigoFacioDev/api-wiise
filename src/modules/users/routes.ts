import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { users, reputationEvents, reservations } from '../../db/schema/index.js';
import { eq, desc, count } from 'drizzle-orm';
import { AppError } from '../../shared/errors/AppError.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireAdmin } from '../../shared/middlewares/admin.js';

export async function usersRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/users', {
    preValidation: [authenticate, requireAdmin],
    schema: {
      tags: ['Users'],
      summary: 'List all users (Admin only)',
      security: [{ bearerAuth: [] }],
      querystring: z.object({
        pagina: z.coerce.number().min(1).optional(),
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).default(10)
      }),
      response: {
        200: z.object({
          data: z.array(z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email(),
            role: z.string(),
            reputationScore: z.number(),
            reputationLevel: z.string(),
            createdAt: z.date()
          })),
          meta: z.object({
            total: z.number(),
            pagina: z.number(),
            limit: z.number(),
            totalPages: z.number()
          })
        })
      }
    }
  }, async (request, reply) => {
    const { pagina, page, limit } = request.query;
    const currentPage = pagina || page || 1;
    const offset = (currentPage - 1) * limit;

    const totalResult = await db.select({ value: count() }).from(users);
    const total = Number(totalResult[0].value);

    const data = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      reputationScore: users.reputationScore,
      reputationLevel: users.reputationLevel,
      createdAt: users.createdAt
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);
    
    return reply.status(200).send({
      data,
      meta: {
        total,
        pagina: currentPage,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  });

  server.get('/users/:id', {
    preValidation: [authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Get user by ID',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string().uuid() })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const result = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      reputationScore: users.reputationScore,
      reputationLevel: users.reputationLevel,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, id)).limit(1);

    if (result.length === 0) throw new AppError('User not found', 'USER_NOT_FOUND', 404);
    return reply.status(200).send(result[0]);
  });

  server.patch('/users/:id', {
    preValidation: [authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Update user',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ name: z.string().min(2).optional() })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const jwtUser = request.user as { id: string, role: string };
    
    if (jwtUser.id !== id && jwtUser.role !== 'admin') {
      throw new AppError('Forbidden', 'FORBIDDEN', 403);
    }

    const { name } = request.body;
    const updated = await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, id)).returning({
      id: users.id, name: users.name
    });

    if (updated.length === 0) throw new AppError('User not found', 'USER_NOT_FOUND', 404);
    return reply.status(200).send(updated[0]);
  });

  server.get('/users/:id/reputation', {
    preValidation: [authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Get user reputation events',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string().uuid() }),
      querystring: z.object({
        pagina: z.coerce.number().min(1).optional(),
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).default(10)
      })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { pagina, page, limit } = request.query;
    const currentPage = pagina || page || 1;
    const offset = (currentPage - 1) * limit;

    const totalResult = await db.select({ value: count() }).from(reputationEvents).where(eq(reputationEvents.userId, id));
    const total = Number(totalResult[0].value);

    const data = await db.select().from(reputationEvents)
      .where(eq(reputationEvents.userId, id))
      .orderBy(desc(reputationEvents.createdAt))
      .limit(limit)
      .offset(offset);

    return reply.status(200).send({
      data,
      meta: { total, pagina: currentPage, limit, totalPages: Math.ceil(total / limit) }
    });
  });

  server.get('/users/:id/reservations', {
    preValidation: [authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Get user reservations',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string().uuid() }),
      querystring: z.object({
        pagina: z.coerce.number().min(1).optional(),
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).default(10)
      })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { pagina, page, limit } = request.query;
    const currentPage = pagina || page || 1;
    const offset = (currentPage - 1) * limit;

    const totalResult = await db.select({ value: count() }).from(reservations).where(eq(reservations.userId, id));
    const total = Number(totalResult[0].value);

    const data = await db.select().from(reservations)
      .where(eq(reservations.userId, id))
      .orderBy(desc(reservations.createdAt))
      .limit(limit)
      .offset(offset);

    return reply.status(200).send({
      data,
      meta: { total, pagina: currentPage, limit, totalPages: Math.ceil(total / limit) }
    });
  });
}
