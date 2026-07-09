import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { Repository } from 'typeorm';
import { EmailService } from './email.service';
import { EntityEmail } from './email.entity'

type EmailCreatedEvent = {
  name: string;
  email: string;
};

@Controller()
export class EmailController {
  constructor(
    @InjectRepository(EntityEmail)
    private readonly emailRepository: Repository<EntityEmail>,

    private readonly mailService: EmailService,
  ) {}

  @EventPattern('email.created')
  async handleEmailCreated(
    @Payload() emailData: EmailCreatedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const normalizedEmail = emailData.email
        .trim()
        .toLowerCase();

      console.log(
        'Email received from RabbitMQ:',
        emailData,
      );

      // Check whether email already exists
      const existingEmail =
        await this.emailRepository.findOne({
          where: {
            email: normalizedEmail,
          },
        });

      if (existingEmail) {
        console.log(
          `${normalizedEmail} already exists in database`,
        );

        
      }

      // Create database entity
      const emailRecord =
        this.emailRepository.create({
          name: emailData.name.trim(),
          email: normalizedEmail,
         
        });

      // Save in MSSQL
      const savedEmail =
        await this.emailRepository.save(emailRecord);

      console.log(
        'Email saved in MSSQL:',
        savedEmail,
      );

      // Send confirmation email
      await this.mailService
        .sendEmailcreateedConfirmation({
          name: savedEmail.name,
          email: savedEmail.email,
        });
      await this.emailRepository.save(savedEmail);

      console.log(
        `Confirmation email sent to ${savedEmail.email}`,
      );
    } catch (error) {
      console.error(
        'Email processing failed:',
        error,
      )
    }
     // Message successfully processed
      channel.ack(originalMessage);
  }

  @Get('received-emails')
  async getEmails() {
    const emails = await this.emailRepository.find({
      order: {
        id: 'DESC',
      },
    });

    return {
      total: emails.length,
      emails,
    };
  }
}