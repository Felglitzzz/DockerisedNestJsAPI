import { Inject, Controller, Get, Post, Body, Param, Query, Put, UseGuards} from '@nestjs/common'
import { ApiUseTags } from '@nestjs/swagger'

import { TYPES } from '../../types'

import { IRoleService } from './roleService'

import { CreateRoleCommand } from './roleCommands'

import { RoleDto } from './roleDtos'

@Controller('api/v1/role')
@ApiUseTags('Role')
export class RoleController {
  private readonly roleService: IRoleService

  public constructor(
    @Inject(TYPES.IRoleService) roleService: IRoleService,
  ) {
    this.roleService = roleService
  }

  @Post()
  async createPermission(@Body() createRoleCommand: CreateRoleCommand): Promise<string> {
    return this.roleService.createRole(createRoleCommand)
  }

  @Get(':id')
  async fetchPermissionById(@Param('id') id): Promise<RoleDto> {
    return this.roleService.fetchRoleById(id)
  }
}