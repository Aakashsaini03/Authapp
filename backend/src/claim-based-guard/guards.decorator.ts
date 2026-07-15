
import{SetMetadata} from "@nestjs/common";
import{ permissions } from "./guard.enum";

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: permissions[]) => SetMetadata(PERMISSIONS_KEY, permissions);