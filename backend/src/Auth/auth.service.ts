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
    const { name, email, password } = signupDto;

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
    });

    await this.userRepository.save(user);

    return {
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
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
        sub: user.id,
        email: user.email,
      },
      
    );

    await redisClient.set(
      `auth:${token}`,
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
      'EX',
      60*60,
    );

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async getAlldata() {
    const users = await this.userRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      message: 'Users fetched successfully',
      users,
    };
  }

  async getProfile(token: string) {
    try {
      const payload = this.jwtService.decode(token) as
        | { sub?: string; email?: string }
        | null;

      if (!payload?.sub || !payload?.email) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const redisData = await redisClient.get(`auth:${token}`);

      if (!redisData) {
        return {
          message: 'Profile data fetched successfully',
          user: {
            id: payload.sub,
            email: payload.email,
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