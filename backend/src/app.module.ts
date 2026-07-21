import { MiddlewareConsumer, Module ,RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './Auth/auth.module';
import { User } from './users/user.entity';
import { AuthController } from './Auth/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogerMiddleware } from './middleware/loger/loger.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
      ConfigModule.forRoot({
    isGlobal:true
  }),
    ThrottlerModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(configservice:ConfigService)=>[
        {
          name: 'default',
          ttl: Number(
            configservice.get<string>('THROTTLE_TTL') 
          ),
          limit: Number(
            configservice.get<string>('LIMIT')   
          ),
        }
      ]
      
      
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
  providers:[
    {
      provide:APP_GUARD,
      useClass:ThrottlerGuard
  }
  ]
  
})
export class AppModule {
  configure(consumer:MiddlewareConsumer) {
    consumer.apply(LogerMiddleware).forRoutes(
      // path:'auth/profile',
      //  method: RequestMethod.GET,
      AuthController


  );
    
     };
}