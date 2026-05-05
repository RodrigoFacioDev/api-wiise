import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('App Endpoints', () => {
  it('GET /health - should return status ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: 'ok' });
  });

  it('GET /docs - should serve swagger documentation', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs'
    });
    expect(response.statusCode).toBe(302); // Redirects to /docs/
  });
});
