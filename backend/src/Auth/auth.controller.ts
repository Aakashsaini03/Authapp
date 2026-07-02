import { Body, Controller, Post, Res,Get,Req,UnauthorizedException,} from '@nestjs/common';
import type { Response ,Request} from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

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
    });

    return {
      message: 'Login Successful',
      user: result.user,
    };
  }

  @Get()
  getall(){
    return this.authService.getAlldata();
  }
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const token = req.cookies?.token;

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    return this.authService.getProfile(token);
  }
   
  @Post('logout')
   async logout(
    @Req() req:Request,
    @Res({ passthrough: true }) res: Response) {
      const token=req.cookies?.token;
       if (token) {
      await this.authService.logout(token);
    }
    res.clearCookie('token');
    



    return {
      message: 'Logout successful',
    };
  }
}