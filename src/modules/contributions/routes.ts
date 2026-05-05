import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { contributions, reservations } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { AppError } from '../../shared/errors/AppError.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireAdmin } from '../../shared/middlewares/admin.js';
import { awardReputation } from '../reputation/service.js';

export async function contributionsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/contributions/:reservationId', {
    preValidation: [authenticate],
    schema: {
      tags: ['Contributions'],
      summary: 'Get contributions for a reservation',
      security: [{ bearerAuth: [] }],
      params: z.object({ reservationId: z.string().uuid() })
    }
  }, async (request, reply) => {
    const { reservationId } = request.params;
    const list = await db.select().from(contributions).where(eq(contributions.reservationId, reservationId));
    return reply.status(200).send(list);
  });

  server.patch('/contributions/:id/validate', {
    preValidation: [authenticate, requireAdmin],
    schema: {
      tags: ['Contributions'],
      summary: 'Validate contribution',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string().uuid() })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    
    const cList = await db.select().from(contributions).where(eq(contributions.id, id)).limit(1);
    if (cList.length === 0) throw new AppError('Contribution not found', 'NOT_FOUND', 404);
    const contribution = cList[0];

    if (contribution.status === 'validated') {
      throw new AppError('Contribution already validated', 'CONTRIBUTION_ALREADY_VALIDATED', 400);
    }

    const updated = await db.update(contributions).set({ status: 'validated', updatedAt: new Date() }).where(eq(contributions.id, id)).returning();
    
    const rList = await db.select().from(reservations).where(eq(reservations.id, contribution.reservationId)).limit(1);
    const reservation = rList[0];
    
    // Award reputation
    if (reservation) {
      await awardReputation(reservation.userId, 'contribution_delivered', 20, reservation.id);
      if (reservation.status === 'completed') {
        await awardReputation(reservation.userId, 'impact_validated', 30, reservation.id);
      }
    }

    return reply.status(200).send(updated[0]);
  });
}
