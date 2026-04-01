import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from '../src/app.module';

let cachedServer: express.Express | null = null;

async function createServer() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  return server;
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await createServer();
  }

  return cachedServer(req, res);
}
