import { Inject, Controller, Get, Post, Body, Param, Query, Put, UseGuards} from '@nestjs/common'
import { ApiUseTags } from '@nestjs/swagger'

import { TYPES } from '../types'

import { IExampleService } from './exampleService'

import { CreateExampleCommand } from './exampleCommands'

import { ExampleDto, QueryExampleRequestDto } from './exampleDtos'

@Controller('api/v1/example')
@ApiUseTags('Example')
export class ResourceController {
  private readonly exampleService: IExampleService

  public constructor(
    @Inject(TYPES.IExampleService) exampleService: IExampleService,
  ) {
    this.exampleService = exampleService
  }

  @Get(':id')
  async getResourceById(@Param('id') id): Promise<ExampleDto> {
    return this.exampleService.fetchExampleById(id)
  }

  @Get()
  async fetchResources(@Query() queryResourceDto: QueryExampleRequestDto): Promise<Array<ExampleDto>> {
    return await this.exampleService.fetchAllExamples(queryResourceDto)
  }

  @Post()
  async createResource(@Body() createResourceCommand: CreateExampleCommand): Promise<string> {
    return await this.exampleService.createExample(createResourceCommand)
  }
}