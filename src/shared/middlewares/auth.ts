import { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/AppError.js';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
  }
}
