import { Inject, Controller, Get, Post, Body, Param, Query, Put, UseGuards} from '@nestjs/common'
import { ApiUseTags } from '@nestjs/swagger'

import { TYPES } from '../../types'

import { IPermissionService } from './permissionService'

import { CreatePermissionCommand } from './permissionCommands'

import { PermissionDto, QueryPermissionRequestDto } from './permissionDtos'

@Controller('api/v1/permission')
@ApiUseTags('Permission')
export class PermissionController {
  private readonly permissionService: IPermissionService

  public constructor(
    @Inject(TYPES.IPermissionService) permission: IPermissionService,
  ) {
    this.permissionService = permission
  }

  @Get('/types')
  async fetchPermissionsTypes(): Promise<Array<{id: any, name: string}>> {
    return this.permissionService.fetchPermissionTypes()
  }

  @Get(':id')
  async fetchPermissionById(@Param('id') id): Promise<PermissionDto> {
    return this.permissionService.fetchResourceById(id)
  }

  @Get()
  async fetchPermissions(@Query() queryPermissionRequestDto: QueryPermissionRequestDto): Promise<Array<PermissionDto>> {
    return this.permissionService.fetchAllPermissions(queryPermissionRequestDto)
  }

  @Post()
  async createPermission(@Body() createPermissionCommand: CreatePermissionCommand): Promise<string> {
    return this.permissionService.createPermission(createPermissionCommand)
  }
}