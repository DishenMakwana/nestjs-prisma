import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Role can be admin | user',
    default: 'admin',
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  mobile: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class ResendEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}
export class ForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  otp: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
