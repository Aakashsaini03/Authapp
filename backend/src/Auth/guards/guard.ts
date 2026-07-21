import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import{redisClient} from '../../redis.provider';
import { guardConstant } from '../../constant/guard.constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, Passport validates the JWT signature and expiry.
    const jwtValid = await super.canActivate(context);

    if (!jwtValid) {
      throw new UnauthorizedException(guardConstant.INVALID_TOKEN);
    }

    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    let token: string | null = null;

    // Try Authorization header first.
    if (
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      token = authHeader.substring(7).trim();
    }

    // If header token is unavailable, try cookie.
    if (!token) {
      token = request.cookies?.token ?? null;
    }

    if (!token) {
      throw new UnauthorizedException(guardConstant.TOKEN_MISSING);
    }

    // Check whether the token session still exists in Redis.
    const session = await redisClient.get(`auth:${token}`);

    if (!session) {
      throw new UnauthorizedException(
        guardConstant.TOKEN_EXPIRED
      );
    }

    return true;
  }
}