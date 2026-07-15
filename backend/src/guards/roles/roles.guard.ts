import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
   
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
     const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,[
        context.getHandler(),
        context.getClass()
      ]
    );

    if(!requiredRoles)
      return true;
  const request = context.switchToHttp().getRequest()

  const user= request.user;
    if(!user)
       throw new ForbiddenException('User information not found');

    
    const allowed =requiredRoles.some((role) => user.roles?.includes(role));
    if(!allowed)
      throw new ForbiddenException('You do not have permission to access this route')
    return true;
  }
}
