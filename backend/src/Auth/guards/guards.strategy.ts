import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { Role } from './roles/roles.enum';
import { Permission } from './claim-based/permission.enum';

type JwtPayload = {
  sub: string;
  Gmail: string;
  role: Role;
  permissions:Permission[];
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (request: Request): string | null => {
        const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

        if (tokenFromHeader) {
          return tokenFromHeader;
        }

        return request.cookies?.token ?? null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  validate(payload: JwtPayload) {
    return {
      UniqueId: payload.sub,
      Gmail: payload.Gmail,
      role: payload.role ,
      permissions: payload.permissions,
    };
  }
}