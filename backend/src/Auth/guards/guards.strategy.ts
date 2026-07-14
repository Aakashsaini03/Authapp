import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { Role } from '../../guards/roles/roles.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (request: Request): string | null => {
        const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

        if (tokenFromHeader) {
          return tokenFromHeader;
        }

        return request?.cookies?.token ?? null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'Aakash123'),
      algorithms: ['HS256'],
    });
  }

  validate(payload: { sub: string; email: string; roles?: Role[] }) {
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [Role.USER],
    };
  }
}