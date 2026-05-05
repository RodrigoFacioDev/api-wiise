import { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/AppError.js';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as { id: string };
  if (!user || !user.id) {
    throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
  }

  const result = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const dbUser = result[0];

  if (!dbUser || dbUser.role !== 'admin') {
    throw new AppError('Forbidden. Admin access required.', 'FORBIDDEN', 403);
  }
}
