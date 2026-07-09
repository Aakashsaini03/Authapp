import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from './email/email.module';
import { EntityEmail } from './email/email.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'Aaka@123',
      database: 'EmailDatabase',
      synchronize: false,
      logging: true,
      entities: [EntityEmail],
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),


    EmailModule,
  ],
})
export class AppModule { }