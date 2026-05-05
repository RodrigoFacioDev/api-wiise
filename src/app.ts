import fastify from 'fastify';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import { AppError } from './shared/errors/AppError.js';
import { authRoutes } from './modules/auth/routes.js';
import { usersRoutes } from './modules/users/routes.js';
import { reservationsRoutes } from './modules/reservations/routes.js';
import { contributionsRoutes } from './modules/contributions/routes.js';
import { impactRoutes } from './modules/impact/routes.js';
import { adminRoutes } from './modules/admin/routes.js';

export const buildApp = async () => {
  const app = fastify({
    logger: true,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Impact Hub API',
        description: 'API form scheduling space using social impact contributions.',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message, statusCode: error.statusCode }
      });
    }

    if (error.validation) {
       return reply.status(400).send({
         error: { code: 'VALIDATION_ERROR', message: error.message, statusCode: 400, details: error.validation }
       });
    }

    request.log.error(error);
    return reply.status(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error', statusCode: 500 }
    });
  });

  await app.register(authRoutes);
  await app.register(usersRoutes);
  await app.register(reservationsRoutes);
  await app.register(contributionsRoutes);
  await app.register(impactRoutes);
  await app.register(adminRoutes);

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
};
