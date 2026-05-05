import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { reservations, users } from '../../db/schema/index.js';
import { eq, desc, count } from 'drizzle-orm';
import { AppError } from '../../shared/errors/AppError.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireAdmin } from '../../shared/middlewares/admin.js';

export async function adminRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/admin/reservations', {
    preValidation: [authenticate, requireAdmin],
    schema: {
      tags: ['Admin'],
      summary: 'Get reservations by status',
      security: [{ bearerAuth: [] }],
      querystring: z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled']).optional(),
        pagina: z.coerce.number().min(1).optional(),
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).default(10)
      })
    }
  }, async (request, reply) => {
    const { status, pagina, page, limit } = request.query;
    const currentPage = pagina || page || 1;
    const offset = (currentPage - 1) * limit;

    let totalQuery = db.select({ value: count() }).from(reservations);
    if (status) {
       // @ts-ignore
       totalQuery = db.select({ value: count() }).from(reservations).where(eq(reservations.status, status));
    }
    const totalResult = await totalQuery;
    const total = Number(totalResult[0].value);

    let query = db.select().from(reservations).orderBy(desc(reservations.createdAt)).limit(limit).offset(offset);
    if (status) {
      // @ts-ignore
      query = db.select().from(reservations).where(eq(reservations.status, status)).orderBy(desc(reservations.createdAt)).limit(limit).offset(offset);
    }
    const data = await query;

    return reply.status(200).send({
      data,
      meta: { total, pagina: currentPage, limit, totalPages: Math.ceil(total / limit) }
    });
  });

  server.get('/admin/dashboard', {
    preValidation: [authenticate, requireAdmin],
    schema: {
      tags: ['Admin'],
      summary: 'Get admin dashboard metrics',
      security: [{ bearerAuth: [] }],
      response: {
        200: z.object({
          totalUsers: z.number(),
          totalReservations: z.number(),
          waitingApproval: z.number()
        })
      }
    }
  }, async (request, reply) => {
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalReservationsResult = await db.select({ count: count() }).from(reservations);
    const pendingReservationsResult = await db.select({ count: count() }).from(reservations).where(eq(reservations.status, 'pending'));

    return reply.status(200).send({
      totalUsers: Number(totalUsersResult[0].count),
      totalReservations: Number(totalReservationsResult[0].count),
      waitingApproval: Number(pendingReservationsResult[0].count)
    });
  });
}
