import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { reservations, users, contributions, reservationImpacts } from '../../db/schema/index.js';
import { eq, desc, count } from 'drizzle-orm';
import { AppError } from '../../shared/errors/AppError.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireAdmin } from '../../shared/middlewares/admin.js';
import { createReservationSchema, updateReservationStatusSchema } from '../../shared/schemas/reservation.js';
import { awardReputation } from '../reputation/service.js';

export async function reservationsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/reservations/equivalence', {
    schema: {
      tags: ['Reservations'],
      summary: 'Calculate equivalence',
      querystring: z.object({
        days: z.coerce.number().positive(),
        type: z.enum(['donation', 'time_impact', 'content_impact']),
        subtype: z.string()
      })
    }
  }, async (request, reply) => {
    const { days, type, subtype } = request.query;
    const valuePerDay = 1000;
    const totalEstimatedValue = days * valuePerDay;

    let suggestedQuantity = 0;
    if (type === 'donation' && subtype === 'cestas_basicas') suggestedQuantity = totalEstimatedValue / 100;
    else if (type === 'time_impact' && subtype === 'aula_gratuita') suggestedQuantity = totalEstimatedValue / 250;
    else if (type === 'content_impact' && subtype === 'video_educativo') suggestedQuantity = totalEstimatedValue / 200;
    else suggestedQuantity = totalEstimatedValue; 

    return reply.status(200).send({
      estimatedValue: totalEstimatedValue,
      suggestedQuantity
    });
  });

  server.post('/reservations', {
    preValidation: [authenticate],
    schema: {
      tags: ['Reservations'],
      summary: 'Create reservation',
      security: [{ bearerAuth: [] }],
      body: createReservationSchema
    }
  }, async (request, reply) => {
    const jwtUser = request.user as { id: string };
    const userList = await db.select().from(users).where(eq(users.id, jwtUser.id)).limit(1);
    const user = userList[0];

    if (!user) throw new AppError('User not found', 'USER_NOT_FOUND', 404);
    if (user.reputationScore < 0) throw new AppError('Reputation too low', 'REPUTATION_TOO_LOW', 403);

    const { startDate, endDate, usageType, eventTitle, eventDescription, contributionType, contributionSubtype, contributionQuantity, contributionUnit, impactCategoryId } = request.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
    const estimatedValue = (days * 1000).toString();

    let equivalentValue = 0;
    if (contributionType === 'donation' && contributionSubtype === 'cestas_basicas') equivalentValue = contributionQuantity * 100;
    else if (contributionType === 'time_impact' && contributionSubtype === 'aula_gratuita') equivalentValue = contributionQuantity * 250;
    else if (contributionType === 'content_impact' && contributionSubtype === 'video_educativo') equivalentValue = contributionQuantity * 200;
    else equivalentValue = contributionQuantity;

    const result = await db.transaction(async (tx) => {
      const res = await tx.insert(reservations).values({
        userId: user.id,
        startDate: start,
        endDate: end,
        usageType,
        eventTitle,
        eventDescription,
        estimatedValue
      }).returning();

      const reservationId = res[0].id;

      await tx.insert(contributions).values({
        reservationId,
        type: contributionType,
        subtype: contributionSubtype,
        quantity: contributionQuantity.toString(),
        unit: contributionUnit,
        equivalentValue: equivalentValue.toString()
      });

      await tx.insert(reservationImpacts).values({
        reservationId,
        impactCategoryId
      });

      return res[0];
    });

    return reply.status(201).send(result);
  });

  server.get('/reservations', {
    preValidation: [authenticate],
    schema: {
      tags: ['Reservations'],
      summary: 'List all reservations',
      security: [{ bearerAuth: [] }],
      querystring: z.object({
        pagina: z.coerce.number().min(1).optional(),
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).default(10)
      })
    }
  }, async (request, reply) => {
    const { pagina, page, limit } = request.query;
    const currentPage = pagina || page || 1;
    const offset = (currentPage - 1) * limit;

    const totalResult = await db.select({ value: count() }).from(reservations);
    const total = Number(totalResult[0].value);

    const data = await db.select().from(reservations)
      .orderBy(desc(reservations.createdAt))
      .limit(limit)
      .offset(offset);
      
    return reply.status(200).send({
      data,
      meta: { total, pagina: currentPage, limit, totalPages: Math.ceil(total / limit) }
    });
  });

  server.get('/reservations/:id', {
    preValidation: [authenticate],
    schema: {
      tags: ['Reservations'],
      summary: 'Get reservation',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string().uuid() })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const resList = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
    if (resList.length === 0) throw new AppError('Reservation not found', 'RESERVATION_NOT_FOUND', 404);
    return reply.status(200).send(resList[0]);
  });

  server.get('/reservations/:id/status', {
    preValidation: [authenticate],
    schema: {
      tags: ['Reservations'],
      summary: 'Get reservation status',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string().uuid() })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const resList = await db.select({ status: reservations.status }).from(reservations).where(eq(reservations.id, id)).limit(1);
    if (resList.length === 0) throw new AppError('Reservation not found', 'RESERVATION_NOT_FOUND', 404);
    return reply.status(200).send({ status: resList[0].status });
  });

  server.patch('/reservations/:id/status', {
    preValidation: [authenticate, requireAdmin],
    schema: {
      tags: ['Reservations'],
      summary: 'Update reservation status',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string().uuid() }),
      body: updateReservationStatusSchema
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    
    // Check if it's completing
    if (status === 'completed') {
       throw new AppError('Use /complete to finish a reservation', 'BAD_REQUEST', 400);
    }

    const updated = await db.update(reservations).set({ status, updatedAt: new Date() }).where(eq(reservations.id, id)).returning();
    if (updated.length === 0) throw new AppError('Reservation not found', 'RESERVATION_NOT_FOUND', 404);

    return reply.status(200).send(updated[0]);
  });

  server.patch('/reservations/:id/complete', {
    preValidation: [authenticate, requireAdmin],
    schema: {
      tags: ['Reservations'],
      summary: 'Mark reservation as completed',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string().uuid() })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    
    const resList = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
    if (resList.length === 0) throw new AppError('Reservation not found', 'RESERVATION_NOT_FOUND', 404);
    const reservation = resList[0];

    const updated = await db.update(reservations).set({ status: 'completed', updatedAt: new Date() }).where(eq(reservations.id, id)).returning();

    // Award reputation
    await awardReputation(reservation.userId, 'event_completed', 10, reservation.id);
    
    // Check if impact is fully validated
    const cList = await db.select().from(contributions).where(eq(contributions.reservationId, id));
    if (cList.length > 0 && cList[0].status === 'validated') {
       await awardReputation(reservation.userId, 'impact_validated', 30, reservation.id);
    }

    return reply.status(200).send(updated[0]);
  });
}
