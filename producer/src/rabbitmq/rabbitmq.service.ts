import { Inject,Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
type EmailCreatedEvent = {
  name: string;
  email: string;
};
@Injectable()
export class RabbitmqService implements OnApplicationBootstrap,OnApplicationShutdown {
    constructor(
        @Inject('RABBITMQ_CLIENT')
        private readonly rabbitclient:ClientProxy
    ){}

       async onApplicationBootstrap():Promise<void> {
       try{
         await this.rabbitclient.connect();
        console.log(' Producer connected to RabbitMq');
       }
       catch (error) {
    console.error('RabbitMQ connection error:', error);
    throw error;
       }
      
  }
   async publishEmailCreated(
    email:EmailCreatedEvent,
  ): Promise<void> {
    await firstValueFrom(
      this.rabbitclient.emit('email.created', email),
    );
  }
   async onApplicationShutdown(): Promise<void> {
    await this.rabbitclient.close();
  }
}
