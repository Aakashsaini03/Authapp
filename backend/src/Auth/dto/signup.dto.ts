import {
  IsString,
  IsEmail,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  role!: string;


  @MinLength(6)
  password!: string;
}