import { Module } from '@nestjs/common';
import { ThrottlerModule,ThrottlerGuard} from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { JwtStrategy } from './guards/guards.strategy';
import { JwtAuthGuard } from './guards/guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { PermissionsGuard } from './guards/claim-based/claim-based-guard';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers:[
        {
          name:'default',
          ttl:60000,
          limit:3
        },
      ],

    }),
    TypeOrmModule.forFeature([User]),

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET','Aakash123'),

        signOptions: {
          expiresIn: '24h',
        },
      }),
    }),

  ],

  controllers: [AuthController],

  providers: [
    
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],

  
})
export class AuthModule {}