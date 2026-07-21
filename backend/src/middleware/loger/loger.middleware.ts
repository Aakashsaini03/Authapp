import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import{Request,Response,NextFunction} from 'express';
@Injectable()
export class LogerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['requestTime'] = new Date();
    const apikey=req.header('x-api-key');
    if(!apikey)
      throw new UnauthorizedException('x-api-key of header is missing');

     if (apikey !== process.env.API_KEY) {
      throw new UnauthorizedException(
        'Invalid API key',
      );
    }
    console.log(`Request Method:${req.method}, Request Url:${req.originalUrl}`);
    next();
  }
}
