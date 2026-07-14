import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import{redisClient} from '../../redis.provider';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, Passport validates the JWT signature and expiry.
    const jwtValid = await super.canActivate(context);

    if (!jwtValid) {
      throw new UnauthorizedException('Invalid access token');
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
      throw new UnauthorizedException('Access token is missing');
    }

    // Check whether the token session still exists in Redis.
    const session = await redisClient.get(`auth:${token}`);

    if (!session) {
      throw new UnauthorizedException(
        'Session expired or user logged out',
      );
    }

    return true;
  }
}