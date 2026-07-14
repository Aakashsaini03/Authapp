import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import  cookieParser from 'cookie-parser';
import { MicroserviceOptions,Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 app.use(cookieParser());
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['RABBITMQ_URL'],
      queue: 'auth_events_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

 app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ],
    credentials: true,
  });

 app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();