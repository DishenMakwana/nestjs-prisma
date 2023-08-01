import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { CustomConfigService } from './config.service';
import { ApiTags } from '@nestjs/swagger';
import { apiDesc, message } from '../common/assets';
import { ApiOperationResponse, Auth } from '../common/decorators';
import { CreateConfigDto, UpdateConfigDto } from './dto';
import { Role } from '@prisma/client';

@ApiTags('CustomConfig')
@Controller('configs')
export class CustomConfigController {
  constructor(private readonly customConfigService: CustomConfigService) {}

  @Auth({ roles: [Role.admin] })
  @ApiOperationResponse(
    apiDesc.config.createConfig,
    HttpStatus.OK,
    message.config.CREATE_CONFIG
  )
  @Post()
  async create(@Body() createSchoolDto: CreateConfigDto) {
    return this.customConfigService.create(createSchoolDto);
  }

  @Auth({ roles: [Role.admin] })
  @ApiOperationResponse(
    apiDesc.config.configList,
    HttpStatus.OK,
    message.config.CONFIG_LIST
  )
  @Get()
  async findAll() {
    return this.customConfigService.findAll();
  }

  @ApiOperationResponse(
    apiDesc.config.allConfig,
    HttpStatus.OK,
    message.config.ALL_CONFIG
  )
  @Get('all')
  async allConfig() {
    return this.customConfigService.allConfig();
  }

  @Auth({ roles: [Role.admin] })
  @ApiOperationResponse(
    apiDesc.config.ConfigSearch,
    HttpStatus.OK,
    message.config.CONFIG_SEARCH
  )
  @Get('search/:key')
  async search(@Param('key') key: string) {
    return this.customConfigService.search(key);
  }

  @Auth({ roles: [Role.admin] })
  @ApiOperationResponse(
    apiDesc.config.configDetails,
    HttpStatus.OK,
    message.config.CONFIG_DETAILS
  )
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customConfigService.findOne(id);
  }

  @Auth({ roles: [Role.admin] })
  @ApiOperationResponse(
    apiDesc.config.updateConfig,
    HttpStatus.OK,
    message.config.UPDATE_CONFIG
  )
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchoolDto: UpdateConfigDto
  ) {
    return this.customConfigService.update(id, updateSchoolDto);
  }

  @Auth({ roles: [Role.admin] })
  @ApiOperationResponse(
    apiDesc.config.deleteConfig,
    HttpStatus.OK,
    message.config.DELETE_CONFIG
  )
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.customConfigService.remove(id);
  }
}
