import {
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  Gmail!: string;

  @IsString()
  role!:string;

  @MinLength(6)
  password!: string;

}