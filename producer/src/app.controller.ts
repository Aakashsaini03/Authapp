import { Body, Controller, Get, Post } from '@nestjs/common';
import{RabbitmqService} from './rabbitmq/rabbitmq.service'

type CreateEmailBody={
  name:string,
  email:string,
};
@Controller('email')
export class AppController {
  constructor(private readonly rabbitService:RabbitmqService) {}

  @Post()
  async createmail(@Body() email:CreateEmailBody,):Promise<{
    message:string;
    email:CreateEmailBody;}>{
    
       await this.rabbitService.publishEmailCreated(email)
       return {
      message: 'email is create and sent to RabbitMQ',
      email,
    };
    }
  }

