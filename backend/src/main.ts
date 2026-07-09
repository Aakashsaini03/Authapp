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
    origin: 'http://localhost:5173',
    credentials: true,
  });

 app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(3000);
  console.log('Backend running on http://localhost:3000');
}

bootstrap();