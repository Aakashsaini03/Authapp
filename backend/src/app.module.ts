import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './Auth/auth.module';
import { User } from './users/user.entity';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { AuthController } from './Auth/auth.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'Aaka@123',
      database: 'typeorm_db',
      synchronize: true,
      logging: true,
      entities: [User],
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),

    AuthModule,

    RabbitmqModule,
  ],
  
})
export class AppModule {}