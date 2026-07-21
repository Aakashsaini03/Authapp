import {
  Body,Controller,Post,Res,Get,Req,UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import {AuthService} from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/guard';
import {RolesGuard} from './guards/roles/roles.guard';
import { Roles } from './guards/roles/roles.decorator';
import { Role } from './guards/roles/roles.enum';
import{PermissionsGuard} from './guards/claim-based/claim-based-guard';
import{Permission} from './guards/claim-based/permission.enum';
import{RequirePermissions} from './guards/claim-based/permission.decorator';
import { LOGIN_SUCCESS,TOKEN_NOT_FOUND } from 'src/constant/auth.constant';
import { minutes, seconds, SkipThrottle,Throttle} from '@nestjs/throttler';
import{LLIMIT,SLIMIT,LTTL,STTL} from 'src/constant/rate_limit_constant'
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

 @Post('signup')
 @Throttle({
  default:{
    limit:SLIMIT,
    ttl:STTL
  }
 })
   signup(@Body() signupDto: SignupDto) {
   console.log('Signup body:', signupDto);
   return this.authService.signup(signupDto);
}

  @Post('login')
  @Throttle({
    default:{
      limit:LLIMIT,
      ttl:LTTL
    }
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge:24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: LOGIN_SUCCESS,
      token:result.token,
      user: result.user,
      requestTime: Req['requestTime'],
    };
  }

  // @Get()
  // getall(){
  //   return this.authService.getAlldata();
  // }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    return request.cookies?.token ?? null;
  }
@UseGuards(JwtAuthGuard)
@Get('profile')
   
  async getProfile(@Req() request: Request) {
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException(TOKEN_NOT_FOUND);
    }

    return this.authService.getProfile(token);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-data')
  getAdminData() {
   return this.authService.getAdminUsers();
   
  }


  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.Read)
  @Get('permission')
  getUsers() {
    return 'User list';
  }


  @Post('logout')
   logout() {
    return 'logout sucessfully';
  }
}


