import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { contributions, reservations, reservationImpacts, impactCategories } from '../../db/schema/index.js';
import { eq, sum } from 'drizzle-orm';
import { AppError } from '../../shared/errors/AppError.js';

export async function impactRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/impact/summary', {
    schema: {
      tags: ['Impact'],
      summary: 'Get global impact summary'
    }
  }, async (request, reply) => {
    // This is a simplified approach summing value globally
    const sumResult = await db.select({ totalValue: sum(contributions.equivalentValue) }).from(contributions).where(eq(contributions.status, 'validated'));
    
    // Additional breakdown logic could be placed here if needed.
    return reply.status(200).send({ totalEquivalentValue: sumResult[0].totalValue || 0 });
  });

  server.get('/impact/user/:userId', {
    schema: {
      tags: ['Impact'],
      summary: 'Get user impact summary',
      params: z.object({ userId: z.string().uuid() })
    }
  }, async (request, reply) => {
    const { userId } = request.params;
    
    // Find all validated reservations for user 
    const rList = await db.select().from(reservations).where(eq(reservations.userId, userId));
    const rIds = rList.map(r => r.id);
    
    let totalValue = 0;
    for (const rId of rIds) {
      const sumResult = await db.select({ totalValue: sum(contributions.equivalentValue) })
      .from(contributions)
      .where(eq(contributions.status, 'validated'))
      .where(eq(contributions.reservationId, rId));
      
      const value = Number(sumResult[0]?.totalValue || 0);
      totalValue += value;
    }

    return reply.status(200).send({ totalEquivalentValue: totalValue });
  });

  server.get('/impact/categories', {
    schema: {
      tags: ['Impact'],
      summary: 'List all impact categories'
    }
  }, async (request, reply) => {
    const list = await db.select().from(impactCategories);
    return reply.status(200).send(list);
  });
}
