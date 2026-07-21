import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';
import{roleConstant} from '../../../constant/guard.constant';

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
  console.log('Required Roles:', requiredRoles);
  console.log('Request user:', user);
    if(!user?.role)
       throw new ForbiddenException(roleConstant.USER_ROLE_NOT_FOUND);

    
    const allowed =requiredRoles.includes(user.role);
    if(!allowed)
      throw new ForbiddenException(roleConstant.NOT_ALLOWED_TO_ACCESS)
    return true;
  }
}
