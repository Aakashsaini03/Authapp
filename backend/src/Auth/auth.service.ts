import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Req,Res
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { redisClient } from '../redis.provider';
import { EMAIL_EXISTS,USER_REGISTERED_SUCCESS,INVALID_EMAIL ,
  PASSWORD_MISMATCH,USER_FETCH_SUCCESS, INVALID_TOKEN,LOGIN_SUCCESS,
  PROFILE_FETCH_SUCCESS,LOGOUT_SUCCESS,
  SESSION_EXPIRED
} from 'src/constant/auth.constant';
import { Permission } from './guards/claim-based/permission.enum';
import { Role } from './guards/roles/roles.enum';
import { response } from 'express';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, Gmail,role, password } = signupDto;

    const existingUser = await this.userRepository.findOne({
      where: { Gmail},
    });

    if (existingUser) {
      throw new BadRequestException(EMAIL_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      name,
      Gmail,
      password: hashedPassword,
      role
      
    });

    await this.userRepository.save(user);

    return {
      message: USER_REGISTERED_SUCCESS,
    };
  }

  async login(loginDto: LoginDto) {
    const { Gmail, role,password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { Gmail},
    });

    if (!user) {
      throw new UnauthorizedException(INVALID_EMAIL);
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException(PASSWORD_MISMATCH);
    }
    let userPermissions: Permission[] = [];

  if (user.role === Role.ADMIN) {
    userPermissions = [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
    ];
  } else if (user.role=== Role.USER){
    userPermissions = [Permission.Read,
      Permission.Create,
    ];
  }
  else{
    userPermissions = [Permission.Read];
  }
  const payload = {
      sub: user.UniqueId,
      Gmail: user.Gmail,
      role: user.role,
      permissions: userPermissions,
    };
    const token = this.jwtService.sign( payload);

    await redisClient.set(
      `auth:${token}`,
      JSON.stringify({
        UniqueId: user.UniqueId,
        Gmail: user.Gmail,
        name: user.name,
        role: user.role,
        permissions: userPermissions,
      }),
      'EX',
      24 * 60 * 60,
    );

    return {
      message: LOGIN_SUCCESS,
      token,
      user: {
        UniqueId: user.UniqueId,
        name: user.name,
        Gmail: user.Gmail,
        role: user.role,
        permissions: userPermissions,
        requestTime: Req['requestTime'],
      },
    };
  }

  async getAlldata() {
    const users = await this.userRepository.find({
      select: {
        UniqueId: true,
        name: true,
        Gmail: true,
        role: true,
      
      },
    });

    return {
      message: USER_FETCH_SUCCESS,
      users,
    };
  }

 async getAdminUsers(): Promise<User[]> {
  return await this.userRepository.find({
    where: {
      role: 'admin',
    },
    select: {
        UniqueId: true,
        name: true,
        Gmail: true,
        role: true,
        
      },
  });
}

  async getProfile(token: string) {
    
    try {
      const payload = await this.jwtService.verifyAsync<{
      sub: string;
      Gmail: string;
      role: string;
    }>(token);
    

      if (!payload?.sub || !payload?.Gmail) {
        throw new UnauthorizedException( INVALID_TOKEN);
      }

      const redisData = await redisClient.get(`auth:${token}`);

      if (!redisData) {
      throw new UnauthorizedException(
       SESSION_EXPIRED,
      );
    }

      return {
        message: PROFILE_FETCH_SUCCESS,
        user: JSON.parse(redisData),
        tokenPayload: payload,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(INVALID_TOKEN);
    }
  }

  async logout(token: string) {
    await redisClient.del(`auth:${token}`);
     response.clearCookie('token');

    return {
      message: LOGOUT_SUCCESS,
    };
  }
}