import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, email,role, password } = signupDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role
      
    });

    await this.userRepository.save(user);

    return {
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, role,password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email,},
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign(
      {
        sub: user.UniqueId,
        email: user.email,
        role: user.role,
      },
      
    );

    await redisClient.set(
      `auth:${token}`,
      JSON.stringify({
        UniqueId: user.UniqueId,
        email: user.email,
        name: user.name,
        role: user.role,
      }),
      'EX',
      60*60,
    );

    return {
      message: 'Login successful',
      token,
      user: {
        UniqueId: user.UniqueId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getAlldata() {
    const users = await this.userRepository.find({
      select: {
        UniqueId: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return {
      message: 'Users fetched successfully',
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
        email: true,
        role: true,
      },
  });
}

  async getProfile(token: string) {
    try {
      const payload = this.jwtService.decode(token) as
        | { sub?: string; email?: string ;role?: string }
        | null;

      if (!payload?.sub || !payload?.email) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const redisData = await redisClient.get(`auth:${token}`);

      if (!redisData) {
        return {
          message: 'Profile data fetched successfully',
          user: {
            UniqueId: payload.sub,
            email: payload.email,
            role: payload.role,
          },
          tokenPayload: payload,
        };
      }

      return {
        message: 'Profile data fetched successfully',
        user: JSON.parse(redisData),
        tokenPayload: payload,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(token: string) {
    await redisClient.del(`auth:${token}`);

    return {
      message: 'Logout successful and token removed',
    };
  }
}