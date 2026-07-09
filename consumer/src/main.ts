import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configservice =app.get(ConfigService);
  const port=configservice.get<number>('PORT')!

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,

    options:{
      urls:[configservice.getOrThrow<string>(
        'RABBITMQ_URL',
      ),
    ],
    queue:configservice.getOrThrow<string>(
      'RABBITMQ_QUEUE',
    ),
    queueOptions:{
      durable:true,
      
    },
   noAck: false,
  prefetchCount: 1,
    
    },
  });
  await app.startAllMicroservices();
  console.log('Consumer connected to RabbitMQ');
  await app.listen(port);

  console.log(`consumer server is run at port:${port}`);
}
bootstrap();
