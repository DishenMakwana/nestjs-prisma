import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateConfigDto {
  @ApiProperty({
    default: 'domain',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  key: string;

  @ApiProperty({
    default: 'redbrick',
  })
  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  value: string;
}

export class UpdateConfigDto extends CreateConfigDto {}
