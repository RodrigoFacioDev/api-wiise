import { buildApp } from './app.js';
import * as dotenv from 'dotenv';
dotenv.config();

const start = async () => {
  const app = await buildApp();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333;

  try {
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
