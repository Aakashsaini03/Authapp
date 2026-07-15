import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './Auth/auth.module';
import { User } from './users/user.entity';
import { AuthController } from './Auth/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { PermissionsGuard } from './claim-based-guard/claim-based-guard.module';

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
      synchronize: false,
      logging: true,
      entities: [User],
    

      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),

    AuthModule,
  ],
  
})
export class AppModule {}