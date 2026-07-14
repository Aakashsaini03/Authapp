import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import {AuthService} from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/guard';
import {RolesGuard} from '../guards/roles/roles.guard';
import { Roles } from '../guards/roles/roles.decorator';
import { Role } from 'src/guards/roles/roles.enum';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

 @Post('signup')
signup(@Body() signupDto: SignupDto) {
  console.log('Signup body:', signupDto);
  return this.authService.signup(signupDto);
}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Login Successful',
      token:result.token,
      user: result.user,
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
      throw new UnauthorizedException('Token not found');
    }

    return this.authService.getProfile(token);
  }
@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-data')
  createUser() {
    return {
      message: 'get the admin data',
    };
  }
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    const result = await this.authService.logout(token);

    response.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return result;
  }
}

