import { Inject, Controller, Get, Post, Body, Param, Query} from '@nestjs/common'
import { ApiUseTags } from '@nestjs/swagger'

import { TYPES } from '../../types'

import { IResourceService } from './resourceService'

import { CreateResourceCommand } from './resourceCommands'

import { ResourceDto, QueryResourceRequestDto } from './resourceDtos'

@Controller('api/v1/resource')
@ApiUseTags('Resource')
export class ResourceController {
  private readonly resourceService: IResourceService

  public constructor(
    @Inject(TYPES.IResourceService) resourceService: IResourceService,
  ) {
    this.resourceService = resourceService
  }

  @Get(':id')
  async getResourceById(@Param('id') id): Promise<ResourceDto> {
    return this.resourceService.fetchResourceById(id)
  }

  @Get()
  async fetchResources(@Query() queryResourceDto: QueryResourceRequestDto): Promise<Array<ResourceDto>> {
    return await this.resourceService.fetchAllResource(queryResourceDto)
  }

  @Post()
  async createResource(@Body() createResourceCommand: CreateResourceCommand): Promise<string> {
    return await this.resourceService.createResource(createResourceCommand)
  }
}