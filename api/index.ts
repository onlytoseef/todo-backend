import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Express } from 'express';
import { AppModule } from '../src/app.module';
import { getCorsOptions } from '../src/common/utils/cors.util';

let cachedServer: Express | null = null;

async function createServer() {
  const expressModule = await import('express');
  const expressFactory = (expressModule.default ?? expressModule) as unknown as () => Express;
  const server = expressFactory();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors(getCorsOptions());

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
  const server = cachedServer ?? (await createServer());
  cachedServer = server;
  return server(req, res);
}
