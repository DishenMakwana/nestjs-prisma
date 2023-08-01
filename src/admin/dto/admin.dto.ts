import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateConfigDto } from '../../config/dto';

export class UpdateAllConfig extends CreateConfigDto {
  @ApiProperty({
    default: {
      id: 1,
    },
  })
  @IsNotEmpty()
  @IsInt()
  id: number;
}
export class UpdateAllConfigDto {
  @ApiProperty({
    default: [
      {
        id: 1,
        key: 'domain',
        value: 'redbrick',
      },
      {
        id: 2,
        key: 'meter',
        value: '12',
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAllConfig)
  config: UpdateAllConfig[];
}
