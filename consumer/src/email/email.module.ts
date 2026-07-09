import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EntityEmail } from './email.entity';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule,

    TypeOrmModule.forFeature([
      EntityEmail,
    ]),

    MailerModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => ({
        transport: {
          host:
            configService.getOrThrow<string>(
              'MAIL_HOST',
            ),

          port: Number(
            configService.getOrThrow<string>(
              'MAIL_PORT',
            ),
          ),
          secure: false,

          auth: {
            user:
              configService.getOrThrow<string>(
                'MAIL_USER',
              ),
            pass:
              configService.getOrThrow<string>(
                'MAIL_PASSWORD',
              ),
          },
        },
        defaults: {
          from:
            configService.getOrThrow<string>(
              'MAIL_FROM',
            ),
        },
      }),
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}