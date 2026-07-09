import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { RabbitmqService } from './rabbitmq.service';
import { RabbitmqController } from './rabbitmq.controller';

@Module({
  imports: [
    ConfigModule,

    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',

        imports: [ConfigModule],

        inject: [ConfigService],

        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.getOrThrow<string>(
                'RABBITMQ_URL',
                
              ),
            ],
            queue: configService.getOrThrow<string>(
              'RABBITMQ_QUEUE',
              
            ),
            queueOptions: {
              durable: true,
              
            },
            
          },
        }),
      },
    ]),
  ],

  providers: [RabbitmqService],

  controllers: [RabbitmqController],

  exports: [RabbitmqService],
})
export class RabbitmqModule {}