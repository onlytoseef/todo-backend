import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getCorsOptions } from './common/utils/cors.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(getCorsOptions());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend running on port ${port}`);
}

bootstrap();
