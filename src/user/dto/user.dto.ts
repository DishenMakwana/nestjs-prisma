import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    default: 'John',
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  firstName: string;

  @ApiProperty({
    default: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  lastName: string;
}

export class UserPhotoDto {
  @ApiProperty({
    type: 'file',
    name: 'photo',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
    isArray: true,
    required: false,
  })
  @IsOptional()
  photo?: Express.Multer.File[];
}

export class FileUploadDto {
  @ApiProperty({
    type: 'file',
    name: 'file',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
    isArray: true,
    required: true,
  })
  @IsNotEmpty()
  file: Express.Multer.File[];
}

export class UserDto {
  @ApiProperty({
    default: 'John',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    default: 'john@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;
}
