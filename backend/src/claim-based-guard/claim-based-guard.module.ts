import{CanActivate, ExecutionContext, Injectable,ForbiddenException} from "@nestjs/common";
import { Observable } from "rxjs";
import { Reflector } from "@nestjs/core";
import { permissions } from "./guard.enum";
import { PERMISSIONS_KEY } from "./guards.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate{
    constructor(private readonly reflector:Reflector){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        throw new Error("Method not implemented.");
    }
    canactivate(context:ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredpermissions= this.reflector.getAllAndOverride<permissions[]>(
            PERMISSIONS_KEY,[
                context.getHandler(),
                context.getClass()
            ]
        );
        if(!requiredpermissions)
            return true;
        const request = context.switchToHttp().getRequest();
        const user= request.user;
        if(!user)
            return false;

         const userPermissions: permissions[] =
      user.permissions ?? [];
        const allowed = requiredpermissions.every((permission)=> userPermissions.includes(permission));

        if(!allowed){
            throw new ForbiddenException('You do not have permission to access this route');
        }
        return true;

    }


}


