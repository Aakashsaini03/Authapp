import{CanActivate, ExecutionContext, Injectable,ForbiddenException} from "@nestjs/common";
import { Observable } from "rxjs";
import { Reflector } from "@nestjs/core";
import { Permission } from "./permission.enum";
import { PERMISSIONS_KEY } from "./permission.decorator";
import{ permissionConstant } from "src/constant/guard.constant";


@Injectable()
export class PermissionsGuard implements CanActivate{
    constructor(private readonly reflector:Reflector){}
    canActivate(context:ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredpermissions= this.reflector.getAllAndOverride<Permission[]>(
            PERMISSIONS_KEY,[
                context.getHandler(),
                context.getClass()
            ],
        );
        if(!requiredpermissions)
            return true;
        const request = context.switchToHttp().getRequest();
        const user= request.user;
        if(!user)
            throw new ForbiddenException(permissionConstant.AUTHOR_NOT_FOUND_ERROR);
    const userPermissions = Array.isArray(user.permissions)? user.permissions: [];
        const allowed = requiredpermissions.every((permission)=> userPermissions.includes(requiredpermissions));

        if(!allowed){
            throw new ForbiddenException(permissionConstant.NOT_ALLOWED_TO_ACCESS_ERROR);
        }
        return true;

    }


}


